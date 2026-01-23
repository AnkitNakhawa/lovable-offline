import { generateAppSpec, updateAppSpec } from '../packages/planner/src/index';

async function testPlanner() {
    console.log("Testing generateAppSpec with dynamic templates...");

    // We expect this to fail nicely if ollama is not running, or if it runs we can inspect logs
    // But since we can't easily query ollama in this environment without it running, we might see errors.
    // However, the main goal is to ensure the code *compiles* and *attempts* to read the registry correctly.

    try {
        await generateAppSpec("I want a landing page with a unique Calculator component that calculates mortgage rates. It should handle slider inputs.");
        console.log("Test 1: Success");
    } catch (e: any) {
        console.log("Test 1: Failed (Expected if Ollama not running)", e.message);
        if (e.message.includes("Registry not found")) {
            console.error("CRITICAL: Registry file missing!");
        }
    }
}

testPlanner();
