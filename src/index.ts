import fs from "node:fs/promises";
import { runResearchEngine } from "./engine/runResearchEngine";
import { createResearchZip } from "./lib/createZip";

async function main() {
    const result = await runResearchEngine(
        "how can I learn AI agent programming using Vercel AI SDK?",
    );

    const zipBuffer = await createResearchZip({
        state: result.state,
        logs: result.logs,
    });

    await fs.mkdir("outputs", { recursive: true });

    await fs.writeFile("outputs/research-output.zip", zipBuffer);

    console.log("ZIP created: outputs/research-output.zip");
}

main();
