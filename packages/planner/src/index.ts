import { AppSpec } from "@lovable/engine/dist/spec/appSpec";
import { Ollama } from 'ollama';
import { SYSTEM_PROMPT } from "./prompt";

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export async function generateAppSpec(prompt: string, model: string = "qwen2.5-coder:7b"): Promise<AppSpec> {
    console.log(`Thinking with ${model}...`);

    try {
        const response = await ollama.chat({
            model: model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ],
            format: 'json', // Enforce JSON mode
            stream: false
        });

        const content = response.message.content;
        const spec = JSON.parse(content);

        // Basic validation
        if (!spec.name || !spec.pages) {
            throw new Error("Invalid spec generated: missing name or pages");
        }

        return spec as AppSpec;
    } catch (error) {
        console.error("Error generating spec:", error);
        throw error;
    }
}

export async function updateAppSpec(currentSpec: AppSpec, prompt: string, model: string = "qwen2.5-coder:7b"): Promise<AppSpec> {
    console.log(`Updating spec with ${model}...`);

    try {
        const response = await ollama.chat({
            model: model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT }, // Re-use main prompt for schema definition
                { role: 'user', content: `Current AppSpec:\n${JSON.stringify(currentSpec, null, 2)}\n\nRequest: ${prompt}\n\nReturn the fully updated JSON.` }
            ],
            format: 'json',
            stream: false
        });

        const content = response.message.content;
        const spec = JSON.parse(content);

        if (!spec.name || !spec.pages) {
            throw new Error("Invalid updated spec generated");
        }

        return spec as AppSpec;
    } catch (error) {
        console.error("Error updating spec:", error);
        throw error;
    }
}
