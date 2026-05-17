export function plannerPrompt(cleanedQuery: string) {
    return `
        You are a planning agent.

        Convert the user query into a clear research goal and 3 to 5 focused research tasks.

        User query:
        ${cleanedQuery}
        `;
}