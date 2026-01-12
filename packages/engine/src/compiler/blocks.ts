import { BlockSpec, ModelSpec } from "../spec/appSpec";

export async function generateBlock(block: BlockSpec, models: ModelSpec[], outDir: string): Promise<string> {
    if (block.type === 'TableCRUD') {
        const modelName = block.model;
        // TODO: Generate component file here, placeholder for now
        return `
        <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold">CRUD for ${modelName}</h2>
            <p>TableCRUD block placeholder</p>
        </div>
        `;
    }
    return "";
}
