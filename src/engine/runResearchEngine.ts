import { runSafetyAgent } from "../agents/safety.agent";
import { runPlannerAgent } from "../agents/planner.agent";
import { runResearchAgent } from "../agents/research.agent";
import { runReportAgent } from "../agents/report.agent";
import type { EngineState, EngineStep } from "../schemas/state.schema";
import { withRetry } from "../lib/retry";

export async function runResearchEngine(
    userQuery = "how can I learn AI agent programming using Vercel AI SDK?",
): Promise<EngineState> {
    const state: EngineState = {
        input: { userQuery },
        metadata: {
            startedAt: new Date().toISOString(),
            status: "running",
            errors: [],
        },
    };

    let currentStep: EngineStep = "safety";

    try {
        currentStep = "safety";
        const safety = await withRetry(() => runSafetyAgent(state.input.userQuery), 0);

        state.safety = safety;

        if (safety.decision === "refuse") {
            state.metadata.status = "refused";
            state.metadata.finishedAt = new Date().toISOString();
            return state;
        }

        currentStep = "planner";
        const planner = await withRetry(
            () =>
                runPlannerAgent({
                    cleanedQuery: safety.cleanedQuery,
                    safetyDecision: safety.decision,
                    riskFlags: safety.riskFlags,
                }),
            1,
        );

        state.planner = planner;

        currentStep = "initial_research";
        const initialResearch = await withRetry(() => runResearchAgent(planner.tasks), 1);

        let findings = initialResearch.findings;

        state.research = {
            findings,
            extraResearchPassUsed: false,
        };

        currentStep = "initial_report";
        let report = await withRetry(
            () =>
                runReportAgent({
                    userQuery: safety.cleanedQuery,
                    goal: planner.goal,
                    findings,
                    allowFollowUpResearch: true,
                }),
            1,
        );

        state.report = report;

        if (report.status === "needs_more_research" && report.followUpTasks.length > 0) {
            currentStep = "follow_up_research";
            const followUpResearch = await withRetry(
                () => runResearchAgent(report.followUpTasks),
                1,
            );

            findings = [...findings, ...followUpResearch.findings];

            state.research = {
                findings,
                followUpFindings: followUpResearch.findings,
                extraResearchPassUsed: true,
            };

            currentStep = "final_report";
            report = await withRetry(
                () =>
                    runReportAgent({
                        userQuery: safety.cleanedQuery,
                        goal: planner.goal,
                        findings,
                        allowFollowUpResearch: false,
                    }),
                1,
            );

            state.report = report;
        }

        state.metadata.status = "success";
        state.metadata.finishedAt = new Date().toISOString();
        return state;
    } catch (error) {
        state.metadata.status = state.safety ? "partial_failure" : "error";
        state.metadata.finishedAt = new Date().toISOString();
        state.metadata.errors.push({
            step: currentStep,
            message: error instanceof Error ? error.message : "Unknown engine error",
        });
        return state;
    } finally {
        console.log(JSON.stringify(state, null, 2));
    }
}
