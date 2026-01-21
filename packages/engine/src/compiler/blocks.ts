import { BlockSpec, ModelSpec } from "../spec/appSpec";
import * as fs from 'fs-extra';
import * as path from 'path';
import { renderTemplate } from "./render";


// Helper to protect user-edited files
async function smartWriteFile(filePath: string, content: string) {
    // 1. Check if file exists
    if (await fs.pathExists(filePath)) {
        // 2. Read first line
        const existingContent = await fs.readFile(filePath, 'utf-8');
        const firstLine = existingContent.split('\n')[0];
        // 3. Check for header
        if (!firstLine.includes('GENERATED FILE - DO NOT EDIT')) {
            console.log(`Skipping protected file: ${path.basename(filePath)}`);
            return;
        }
    }
    // 4. Write if safe
    await fs.writeFile(filePath, content);
}

export async function generateBlock(block: BlockSpec, models: ModelSpec[], outDir: string): Promise<{ code: string, imports: string[] }> {
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
        await smartWriteFile(actionsPath, `// GENERATED FILE - DO NOT EDIT\n${actionsContent}`);

        // 2. Generate UI Component
        const componentContent = renderTemplate('blocks/table-crud.tsx.hbs', {
            modelName,
            fields: model.fields
        });
        const componentPath = path.join(outDir, 'components', 'generated', `${modelName}Crud.tsx`);
        await fs.mkdir(path.dirname(componentPath), { recursive: true });
        await smartWriteFile(componentPath, `// GENERATED FILE - DO NOT EDIT\n${componentContent}`);

        // 3. Return glue code and imports
        return {
            code: `
        <${modelName}Crud 
            initialData={await get${modelName}s()} 
            actions={{ create: create${modelName}, update: update${modelName}, delete: delete${modelName} }} 
        />
        `,
            imports: [
                `import ${modelName}Crud from "@/components/generated/${modelName}Crud";`,
                `import { get${modelName}s, create${modelName}, update${modelName}, delete${modelName} } from "@/app/actions/${modelNameLower}";`
            ]
        };
    }
    if (block.type === 'Hero') {
        // Use existing ID or generate a new stable one
        if (!block.id) {
            block.id = Math.random().toString(36).substring(7);
        }
        const componentName = `Hero${block.id}`;

        const componentContent = renderTemplate('blocks/hero.tsx.hbs', {
            componentName,
            headline: block.headline,
            subheadline: block.subheadline,
            ctaText: block.ctaText
        });

        const componentPath = path.join(outDir, 'components', 'generated', `${componentName}.tsx`);
        await fs.mkdir(path.dirname(componentPath), { recursive: true });
        await smartWriteFile(componentPath, `// GENERATED FILE - DO NOT EDIT\n${componentContent}`);

        return {
            code: `<${componentName} />`,
            imports: [`import ${componentName} from "@/components/generated/${componentName}";`]
        };
    }
    if (block.type === 'Features') {
        if (!block.id) {
            block.id = Math.random().toString(36).substring(7);
        }
        const componentName = `Features${block.id}`;

        const componentContent = renderTemplate('blocks/features.tsx.hbs', {
            componentName,
            title: block.title,
            features: block.features
        });

        const componentPath = path.join(outDir, 'components', 'generated', `${componentName}.tsx`);
        await fs.mkdir(path.dirname(componentPath), { recursive: true });
        await smartWriteFile(componentPath, `// GENERATED FILE - DO NOT EDIT\n${componentContent}`);

        return {
            code: `<${componentName} />`,
            imports: [`import ${componentName} from "@/components/generated/${componentName}";`]
        };
    }
    if (block.type === 'Navbar') {
        if (!block.id) {
            block.id = Math.random().toString(36).substring(7);
        }
        const componentName = `Navbar${block.id}`;

        const componentContent = renderTemplate('blocks/navbar.tsx.hbs', {
            componentName,
            logo: block.logo,
            links: block.links
        });

        const componentPath = path.join(outDir, 'components', 'generated', `${componentName}.tsx`);
        await fs.mkdir(path.dirname(componentPath), { recursive: true });
        await smartWriteFile(componentPath, `// GENERATED FILE - DO NOT EDIT\n${componentContent}`);

        return {
            code: `<${componentName} />`,
            imports: [`import ${componentName} from "@/components/generated/${componentName}";`]
        };
    }
    if (block.type === 'Footer') {
        if (!block.id) {
            block.id = Math.random().toString(36).substring(7);
        }
        const componentName = `Footer${block.id}`;

        const componentContent = renderTemplate('blocks/footer.tsx.hbs', {
            componentName,
            copyright: block.copyright,
            links: block.links
        });

        const componentPath = path.join(outDir, 'components', 'generated', `${componentName}.tsx`);
        await fs.mkdir(path.dirname(componentPath), { recursive: true });
        await smartWriteFile(componentPath, `// GENERATED FILE - DO NOT EDIT\n${componentContent}`);

        return {
            code: `<${componentName} />`,
            imports: [`import ${componentName} from "@/components/generated/${componentName}";`]
        };
    }
    if (block.type === 'Pricing') {
        if (!block.id) {
            block.id = Math.random().toString(36).substring(7);
        }
        const componentName = `Pricing${block.id}`;

        const componentContent = renderTemplate('blocks/pricing.tsx.hbs', {
            componentName,
            title: block.title,
            plans: block.plans
        });

        const componentPath = path.join(outDir, 'components', 'generated', `${componentName}.tsx`);
        await fs.mkdir(path.dirname(componentPath), { recursive: true });
        await smartWriteFile(componentPath, `// GENERATED FILE - DO NOT EDIT\n${componentContent}`);

        return {
            code: `<${componentName} />`,
            imports: [`import ${componentName} from "@/components/generated/${componentName}";`]
        };
    }
    return { code: "", imports: [] };
}
