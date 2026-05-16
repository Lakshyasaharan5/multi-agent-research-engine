import { runSafetyAgent } from "../agents/safety.agent";
import { runPlannerAgent } from "../agents/planner.agent";
import { runResearchAgent } from "../agents/research.agent";
import { runReportAgent } from "../agents/report.agent";

export async function runResearchEngine() {
    const safetyResult = await runSafetyAgent("test query");
    console.log(safetyResult);

    const plannerResult = await runPlannerAgent(safetyResult.result);
    console.log(plannerResult);

    const researchResult = await runResearchAgent(plannerResult.tasks);
    console.log(researchResult);

    const reportResult = await runReportAgent(researchResult.findings);
    console.log(reportResult);
}


