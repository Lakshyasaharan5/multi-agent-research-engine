export function reportPrompt(input: {
    userQuery: string;
    goal: string;
    findings: unknown;
}) {
    return `
        You are a report agent.

        Create a clear final report for the user query.

        User query:
        ${input.userQuery}

        Research goal:
        ${input.goal}

        Research findings:
        ${JSON.stringify(input.findings, null, 2)}

        Rules:
        - Use only the provided research findings.
        - Do not invent sources.
        - Write clearly and practically.
        - Include citations from the provided sources.
        - Mention limitations if evidence is incomplete.
        - Do not create a section about limitations, gaps, or uncertainty.
        - Limitations should only appear in the dedicated limitations field.
        `;
}