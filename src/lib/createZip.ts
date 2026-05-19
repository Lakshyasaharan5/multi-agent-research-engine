import JSZip from "jszip";
import type { EngineState } from "../schemas/state.schema.js";

type CreateResearchZipInput = {
    state: EngineState;
    logs: string;
};

function formatReportMarkdown(state: EngineState): string {
    const report = state.report?.report;

    if (!report) {
        return [
            "# Research Report",
            "",
            "No final report was generated.",
            "",
            `Status: ${state.metadata.status}`,
        ].join("\n");
    }

    const sections = report.sections
        .map((section) =>
            `
## ${section.heading}

${section.content}
`.trim(),
        )
        .join("\n\n");

    const citations = report.citations.length
        ? report.citations
              .map((citation, index) => `${index + 1}. [${citation.title}](${citation.url})`)
              .join("\n")
        : "No citations provided.";

    const limitations = report.limitations.length
        ? report.limitations.map((limitation) => `- ${limitation}`).join("\n")
        : "No limitations provided.";

    return `
# ${report.title}

## Summary

${report.summary}

${sections}

## Citations

${citations}

## Limitations

${limitations}
`.trim();
}

export async function createResearchZip({ state, logs }: CreateResearchZipInput): Promise<Buffer> {
    const zip = new JSZip();

    zip.file("state.json", JSON.stringify(state, null, 2));
    zip.file("logs.txt", logs);
    zip.file("report.md", formatReportMarkdown(state));

    return zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
}
