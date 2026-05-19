import { runSafetyAgent } from "../agents/safety.agent.js";
import { runPlannerAgent } from "../agents/planner.agent.js";
import { runResearchAgent } from "../agents/research.agent.js";
import { runReportAgent } from "../agents/report.agent.js";
import type { EngineState, EngineStep } from "../schemas/state.schema.js";
import { withRetry } from "../lib/retry.js";
import { Logger } from "../lib/logger.js";
import { Cache } from "../cache/cache.js";
import { SemanticCache } from "../cache/semanticCache.js";

type EngineRunResult = {
    state: EngineState;
    logs: string;
};

function createCacheKey(userQuery: string) {
    const normalized = userQuery.trim().toLowerCase().replace(/\s+/g, " ");
    return `engine:v1:${normalized}`;
}

export async function runResearchEngine(
    userQuery = "how can I learn AI agent programming using Vercel AI SDK?",
): Promise<EngineRunResult> {
    const logger = new Logger("Engine");
    logger.info("Research engine started", { userQuery });

    const cache = new Cache(logger.child("Cache"));
    const semanticCache = new SemanticCache(logger.child("SemanticCache"));

    const cacheKey = createCacheKey(userQuery);
    const cachedState = await cache.get<EngineState>(cacheKey);

    if (cachedState) {
        cachedState.metadata.cached = true;
        cachedState.metadata.cacheType = "exact";
        cachedState.metadata.matchedCachedQuery = cachedState.input.userQuery;
        logger.info("Cache hit", { cacheKey });
        return { state: cachedState, logs: logger.getLogs() };
    }

    logger.info("Cache miss", { cacheKey });

    const state: EngineState = {
        input: { userQuery },
        metadata: {
            startedAt: new Date().toISOString(),
            status: "running",
            errors: [],
            cached: false,
        },
    };
    const retryLogger = logger.child("Retry");
    let currentStep: EngineStep = "safety";
    try {
        currentStep = "safety";
        logger.info("Running safety agent");
        const safety = await withRetry(
            () => runSafetyAgent(state.input.userQuery, logger.child("Safety")),
            0,
            retryLogger,
            { step: currentStep },
        );
        logger.info("Safety agent completed", {
            decision: safety.decision,
            riskFlags: safety.riskFlags.length,
        });
        state.safety = safety;

        if (safety.decision === "refuse") {
            logger.info("Pipeline refused by safety agent");
            state.metadata.status = "refused";
            state.metadata.finishedAt = new Date().toISOString();
            await cache.set(cacheKey, state);
            return { state, logs: logger.getLogs() };
        }

        const semanticHit = await semanticCache.findSimilar(safety.cleanedQuery);

        if (semanticHit) {
            logger.info("Semantic cache hit", {
                similarity: semanticHit.similarity,
                matchedQuery: semanticHit.matchedQuery,
            });

            semanticHit.state.metadata.cached = true;
            semanticHit.state.metadata.cacheType = "semantic";
            semanticHit.state.metadata.cacheSimilarity = semanticHit.similarity;
            semanticHit.state.metadata.matchedCachedQuery = semanticHit.matchedQuery;

            await cache.set(cacheKey, semanticHit.state);

            return { state: semanticHit.state, logs: logger.getLogs() };
        }

        logger.info("Semantic cache miss");

        currentStep = "planner";
        logger.info("Running planner agent");
        const planner = await withRetry(
            () =>
                runPlannerAgent(
                    {
                        cleanedQuery: safety.cleanedQuery,
                        safetyDecision: safety.decision,
                        riskFlags: safety.riskFlags,
                    },
                    logger.child("Planner"),
                ),
            1,
            retryLogger,
            { step: currentStep },
        );
        logger.info("Planner agent completed", {
            taskCount: planner.tasks.length,
        });

        state.planner = planner;

        currentStep = "initial_research";
        logger.info("Running initial research agent");
        const initialResearch = await withRetry(
            () => runResearchAgent(planner.tasks, logger.child("Research")),
            1,
            retryLogger,
            { step: currentStep },
        );
        logger.info("Initial research completed", {
            findingCount: initialResearch.findings.length,
        });

        let findings = initialResearch.findings;

        state.research = {
            findings,
            extraResearchPassUsed: false,
        };

        currentStep = "initial_report";
        logger.info("Running report agent");
        let report = await withRetry(
            () =>
                runReportAgent(
                    {
                        userQuery: safety.cleanedQuery,
                        goal: planner.goal,
                        findings,
                        allowFollowUpResearch: true,
                    },
                    logger.child("Report"),
                ),
            1,
            retryLogger,
            { step: currentStep },
        );
        logger.info("Report agent completed", {
            status: report.status,
        });

        state.report = report;

        if (report.status === "needs_more_research" && report.followUpTasks.length > 0) {
            currentStep = "follow_up_research";
            logger.info("Running follow-up research", {
                followUpTaskCount: report.followUpTasks.length,
            });
            const followUpResearch = await withRetry(
                () => runResearchAgent(report.followUpTasks, logger.child("Research")),
                1,
                retryLogger,
                { step: currentStep },
            );
            logger.info("Follow-up research completed", {
                additionalFindings: followUpResearch.findings.length,
            });

            findings = [...findings, ...followUpResearch.findings];

            state.research = {
                findings,
                followUpFindings: followUpResearch.findings,
                extraResearchPassUsed: true,
            };

            currentStep = "final_report";
            logger.info("Running final report generation");
            report = await withRetry(
                () =>
                    runReportAgent(
                        {
                            userQuery: safety.cleanedQuery,
                            goal: planner.goal,
                            findings,
                            allowFollowUpResearch: false,
                        },
                        logger.child("Report"),
                    ),
                1,
                retryLogger,
                { step: currentStep },
            );
            logger.info("Final report generated", {
                status: report.status,
            });

            state.report = report;
        }

        state.metadata.status = "success";
        state.metadata.finishedAt = new Date().toISOString();

        await cache.set(cacheKey, state);
        await semanticCache.set(safety.cleanedQuery, state);

        logger.metric("Research engine completed", {
            status: state.metadata.status,
            extraResearchPassUsed: state.research?.extraResearchPassUsed ?? false,
        });

        return { state, logs: logger.getLogs() };
    } catch (error) {
        state.metadata.status = state.safety ? "partial_failure" : "error";
        state.metadata.finishedAt = new Date().toISOString();
        state.metadata.errors.push({
            step: currentStep,
            message: error instanceof Error ? error.message : "Unknown engine error",
        });
        logger.error("Research engine failed", {
            step: currentStep,
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return { state, logs: logger.getLogs() };
    } finally {
        // console.log(logger.getLogs());
        // console.log(JSON.stringify(state, null, 2));
    }
}
