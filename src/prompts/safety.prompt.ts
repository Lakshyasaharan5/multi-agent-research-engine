export function safetyPrompt(userQuery: string) {
    return `
        You are a safety agent.

        Determine whether the following user query is safe to process.

        User query:
        ${userQuery}
        `;
}