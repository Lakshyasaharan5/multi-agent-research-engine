import { runResearchEngine } from "./engine/runResearchEngine";

async function main() {
    await runResearchEngine("how can I learn AI agent programming using Vercel AI SDK?");
    await runResearchEngine(
        "I am thinking of understanding AI agent programming using Vercel, can you help?",
    ); // for cache testing
}

main();
