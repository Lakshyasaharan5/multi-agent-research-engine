import { runSafetyAgent } from "../agents/safety.agent";
import { runPlannerAgent } from "../agents/planner.agent";
import { runResearchAgent } from "../agents/research.agent";
import { runReportAgent } from "../agents/report.agent";

export async function runResearchEngine() {
    const safetyResult = await runSafetyAgent("how can I learn AI agent programming using Vercel AI SDK?");
    console.log("Safety Result:", safetyResult);

    if (safetyResult.decision === "refuse") {
        return {
            status: "refused" as const,
            reason: safetyResult.reason,
            riskFlags: safetyResult.riskFlags,
        };
    }

    const plannerResult = await runPlannerAgent({
        cleanedQuery: safetyResult.cleanedQuery,
        safetyDecision: safetyResult.decision,
        riskFlags: safetyResult.riskFlags,
    });
    console.log("Planner Result:", plannerResult);

    const researchResult = await runResearchAgent(plannerResult.tasks);
    console.log("Research Result:", JSON.stringify(researchResult, null, 2));

    const reportResult = await runReportAgent({
        userQuery: safetyResult.cleanedQuery,
        goal: plannerResult.goal,
        findings: researchResult.findings,
    });
    console.log("Report Result:", JSON.stringify(reportResult, null, 2));
}



