import { runSafetyAgent } from "../agents/safety.agent";
import { runPlannerAgent } from "../agents/planner.agent";
import { runResearchAgent } from "../agents/research.agent";
import { runReportAgent } from "../agents/report.agent";
import type { EngineState } from "../schemas/state.schema";

export async function runResearchEngine(
    userQuery = "how can I learn AI agent programming using Vercel AI SDK?",
): Promise<EngineState> {
    const state: EngineState = {
        input: { userQuery },
        metadata: {
            startedAt: new Date().toISOString(),
            status: "running",
        },
    };

    state.safety = await runSafetyAgent(state.input.userQuery);

    if (state.safety.decision === "refuse") {
        state.metadata.status = "refused";
        state.metadata.finishedAt = new Date().toISOString();
        return state;
    }

    state.planner = await runPlannerAgent({
        cleanedQuery: state.safety.cleanedQuery,
        safetyDecision: state.safety.decision,
        riskFlags: state.safety.riskFlags,
    });

    const initialResearch = await runResearchAgent(state.planner.tasks);

    state.research = {
        findings: initialResearch.findings,
        extraResearchPassUsed: false,
    };

    state.report = await runReportAgent({
        userQuery: state.safety.cleanedQuery,
        goal: state.planner.goal,
        findings: state.research.findings,
        allowFollowUpResearch: true,
    });

    if (state.report.status === "needs_more_research" && state.report.followUpTasks.length > 0) {
        const followUpResearch = await runResearchAgent(state.report.followUpTasks);

        state.research.followUpFindings = followUpResearch.findings;
        state.research.findings = [...state.research.findings, ...followUpResearch.findings];
        state.research.extraResearchPassUsed = true;

        state.report = await runReportAgent({
            userQuery: state.safety.cleanedQuery,
            goal: state.planner.goal,
            findings: state.research.findings,
            allowFollowUpResearch: false,
        });
    }

    state.metadata.status = "success";
    state.metadata.finishedAt = new Date().toISOString();
    console.log("Engine State:", state);
    return state;
}
