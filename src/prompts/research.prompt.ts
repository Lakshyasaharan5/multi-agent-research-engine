export function researchPrompt(tasks: string[]) {
    return `
        You are a research agent.

        Use web search to research the following tasks.

        Tasks:
        ${tasks.map((task, index) => `${index + 1}. ${task}`).join("\n")}

        For each task, gather relevant source-backed findings.
        Do not write the final report yet.
        `;
}