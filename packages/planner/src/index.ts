import { AppSpec } from "@lovable/engine/dist/spec/appSpec";
import { Ollama } from 'ollama';
import { SELECT_BLOCKS_PROMPT, GENERATE_SYSTEM_PROMPT, UPDATE_SYSTEM_PROMPT } from "./prompt";
import * as fs from 'fs-extra';
import * as path from 'path';

// Helper to load registry
function loadRegistry() {
    const registryPath = path.resolve(__dirname, '../../templates/registry.json');
    if (!fs.existsSync(registryPath)) {
        throw new Error(`Registry not found at ${registryPath}`);
    }
    const registry = fs.readJSONSync(registryPath);

    const themesPath = path.resolve(__dirname, '../../templates/themes.json');
    if (fs.existsSync(themesPath)) {
        const themes = fs.readJSONSync(themesPath);
        registry.themes = themes.themes;
    }
    return registry;
}

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export async function generateAppSpec(prompt: string, model: string = "qwen2.5-coder:7b"): Promise<AppSpec> {
    console.log(`Thinking with ${model}...`);
    try {
        const registry = loadRegistry();
        const availableBlocks = registry.blocks.map((b: any) => ({ name: b.name, description: b.description }));
        const availableThemes = registry.themes ? registry.themes.map((t: any) => ({ id: t.id, name: t.name, description: t.description })) : [];

        // Step 1: Select Blocks
        console.log("Selecting blocks and theme...");
        const selectResponse = await ollama.chat({
            model: model,
            messages: [
                { role: 'system', content: SELECT_BLOCKS_PROMPT(availableBlocks, availableThemes) },
                { role: 'user', content: prompt }
            ],
            format: 'json',
            stream: false
        });

        const selection = JSON.parse(selectResponse.message.content);
        const selectedBlocks = selection.selectedBlocks || [];
        const selectedTheme = selection.selectedTheme;
        console.log("Selected blocks:", selectedBlocks, "Theme:", selectedTheme);

        // Filter registry for selected schemas
        let activeBlocks = registry.blocks.filter((b: any) =>
            selectedBlocks.some((selected: string) =>
                selected.toLowerCase() === b.name.toLowerCase() ||
                selected.toLowerCase().includes(b.name.toLowerCase()) ||
                b.name.toLowerCase().includes(selected.toLowerCase())
            )
        );

        // Check for Custom blocks
        // If the planner selected something that IS NOT in our standard registry (except Custom), 
        // we should add the "Custom" block schema to the generation context so the planner knows it CAN use it.
        const knownBlockNames = registry.blocks.map((b: any) => b.name.toLowerCase());
        const hasUnknownBlocks = selectedBlocks.some((s: string) => !knownBlockNames.includes(s.toLowerCase()));

        if (hasUnknownBlocks) {
            const customBlock = registry.blocks.find((b: any) => b.name === 'Custom');
            if (customBlock) {
                // Avoid duplicates if Custom was already selected
                if (!activeBlocks.find((b: any) => b.name === 'Custom')) {
                    activeBlocks.push(customBlock);
                }
            }
        }

        // Fallback: if nothing selected, use common blocks
        if (activeBlocks.length === 0) {
            console.log("No blocks selected, defaulting to common blocks.");
            activeBlocks = registry.blocks.filter((b: any) => ['Navbar', 'Hero', 'Footer'].includes(b.name));
        }

        const blockSchemas = activeBlocks.map((b: any) => b.schema);

        // Step 2: Generate Spec
        console.log("Generating spec...");
        const response = await ollama.chat({
            model: model,
            messages: [
                { role: 'system', content: GENERATE_SYSTEM_PROMPT(blockSchemas) },
                { role: 'user', content: `${prompt}\n\nIMPORTANT: Use the theme '${selectedTheme}' if applicable.` }
            ],
            format: 'json',
            stream: false
        });

        const content = response.message.content;
        const spec = JSON.parse(content);

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
        const registry = loadRegistry();
        // For updates, we provide all block schemas to allow adding new types of blocks
        // For optimization in future: could infer needed blocks from request
        const blockSchemas = registry.blocks.map((b: any) => b.schema);

        const response = await ollama.chat({
            model: model,
            messages: [
                { role: 'system', content: UPDATE_SYSTEM_PROMPT(blockSchemas) }, // Re-use main prompt for schema definition
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
