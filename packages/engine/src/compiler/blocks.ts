import { BlockSpec, ModelSpec } from "../spec/appSpec";
import * as fs from 'fs-extra';
import * as path from 'path';
import { renderTemplate } from "./render";

export async function generateBlock(block: BlockSpec, models: ModelSpec[], outDir: string): Promise<string> {
    if (block.type === 'TableCRUD') {
        const modelName = block.model;
        const model = models.find(m => m.name === modelName);
        if (!model) {
            throw new Error(`Model ${modelName} not found`);
        }
        const modelNameLower = modelName.toLowerCase();

        // 1. Generate Server Actions
        const actionsContent = renderTemplate('blocks/server-actions.ts.hbs', {
            modelName,
            modelNameLower
        });
        const actionsPath = path.join(outDir, 'app', 'actions', `${modelNameLower}.ts`);
        await fs.mkdir(path.dirname(actionsPath), { recursive: true });
        await fs.writeFile(actionsPath, `// GENERATED FILE - DO NOT EDIT\n${actionsContent}`);

        // 2. Generate UI Component
        const componentContent = renderTemplate('blocks/table-crud.tsx.hbs', {
            modelName,
            fields: model.fields
        });
        const componentPath = path.join(outDir, 'components', 'generated', `${modelName}Crud.tsx`);
        await fs.mkdir(path.dirname(componentPath), { recursive: true });
        await fs.writeFile(componentPath, `// GENERATED FILE - DO NOT EDIT\n${componentContent}`);

        return `
        <${modelName}Crud 
            initialData={await get${modelName}s()} 
            actions={{ create: create${modelName}, update: update${modelName}, delete: delete${modelName} }} 
        />
        `;
    }
    return "";
}
