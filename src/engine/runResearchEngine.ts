import { runSafetyAgent } from "../agents/safety.agent";
import { runPlannerAgent } from "../agents/planner.agent";
import { runResearchAgent } from "../agents/research.agent";
import { runReportAgent } from "../agents/report.agent";

export async function runResearchEngine() {
    const safetyResult = await runSafetyAgent(
        "how can I learn AI agent programming using Vercel AI SDK?",
    );
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

    let reportResult = await runReportAgent({
        userQuery: safetyResult.cleanedQuery,
        goal: plannerResult.goal,
        findings: researchResult.findings,
        allowFollowUpResearch: true,
    });
    console.log("Report Result:", JSON.stringify(reportResult, null, 2));

    if (reportResult.status === "needs_more_research" && reportResult.followUpTasks.length > 0) {
        const followUpResearchResult = await runResearchAgent(reportResult.followUpTasks);

        const mergedFindings = [
            ...researchResult.findings,
            ...followUpResearchResult.findings,
        ];

        reportResult = await runReportAgent({
            userQuery: safetyResult.cleanedQuery,
            goal: plannerResult.goal,
            findings: mergedFindings,
            allowFollowUpResearch: false,
        });

        return {
            status: "success" as const,
            safety: safetyResult,
            planner: plannerResult,
            research: {
                findings: mergedFindings,
                extraResearchPassUsed: true,
            },
            report: reportResult,
        };
    }

    return {
        status: "success" as const,
        safety: safetyResult,
        planner: plannerResult,
        research: {
            findings: researchResult.findings,
            extraResearchPassUsed: false,
        },
        report: reportResult,
    };
}
