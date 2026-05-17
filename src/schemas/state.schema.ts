import type { SafetyResult } from "./safety.schema";
import type { PlannerResult } from "./planner.schema";
import type { ResearchResult } from "./research.schema";
import type { ReportResult } from "./report.schema";

export type EngineState = {
    input: {
        userQuery: string;
    };

    safety?: SafetyResult;

    planner?: PlannerResult;

    research?: {
        findings: ResearchResult["findings"];
        followUpFindings?: ResearchResult["findings"];
        extraResearchPassUsed: boolean;
    };

    report?: ReportResult;

    metadata: {
        startedAt: string;
        finishedAt?: string;
        status: "running" | "success" | "refused" | "error";
    };
};

export default EngineState;
