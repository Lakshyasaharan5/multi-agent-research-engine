import { runResearchEngine } from "./engine/runResearchEngine";

async function main() {
    await runResearchEngine();
    await runResearchEngine(); // for cache testing
}

main();
