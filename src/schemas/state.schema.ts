import type { SafetyResult } from "./safety.schema";
import type { PlannerResult } from "./planner.schema";
import type { ResearchResult } from "./research.schema";
import type { ReportResult } from "./report.schema";

export type EngineStep =
    | "safety"
    | "planner"
    | "initial_research"
    | "initial_report"
    | "follow_up_research"
    | "final_report";

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
        status: "running" | "success" | "refused" | "error" | "partial_failure";
        cached: boolean;
        errors: {
            step: EngineStep;
            message: string;
        }[];
    };
};

export default EngineState;
