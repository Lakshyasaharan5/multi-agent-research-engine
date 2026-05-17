import { runSafetyAgent } from "../agents/safety.agent";
import { runPlannerAgent } from "../agents/planner.agent";
import { runResearchAgent } from "../agents/research.agent";
import { runReportAgent } from "../agents/report.agent";

export async function runResearchEngine() {
    const safetyResult = await runSafetyAgent("how can I learn AI agent programming using Vercel AI SDK?");
    console.log("Safety Result:", safetyResult);

    const plannerResult = await runPlannerAgent(safetyResult.cleanedQuery);
    console.log("Planner Result:", plannerResult);

    const researchResult = await runResearchAgent(plannerResult.tasks);
    console.log("Research Result:", JSON.stringify(researchResult, null, 2));
    
    // const reportResult = await runReportAgent(researchResult.findings);
    // console.log(reportResult);
}



