export async function runResearchAgent(tasks: string[]) {
  return {
    findings: tasks.map((task, index) => ({
      task,
      title: `Dummy Source ${index + 1}`,
      url: `https://example.com/source-${index + 1}`,
      summary: `Dummy finding for: ${task}`,
    })),
  };
}