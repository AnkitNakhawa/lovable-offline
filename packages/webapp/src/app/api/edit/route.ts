import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { updateAppSpec } from '@lovable/planner';
import { compileApp } from '@lovable/engine';

const WORKSPACES_DIR = path.resolve(process.cwd(), '../../workspaces');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, projectName } = body;

        if (!prompt || !projectName) {
            return NextResponse.json({ error: 'Prompt and projectName are required' }, { status: 400 });
        }

        const projectDir = path.join(WORKSPACES_DIR, projectName);
        const specPath = path.join(projectDir, 'lovable.json');

        if (!fs.existsSync(specPath)) {
            return NextResponse.json({ error: 'Project not found or not a lovable project' }, { status: 404 });
        }

        // 1. Load existing spec
        const currentSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

        // 2. Update Spec
        console.log('Updating spec for', projectName);
        const newSpec = await updateAppSpec(currentSpec, prompt);

        // 3. Compile (Incremental)
        console.log('Re-compiling...');
        const templatesDir = path.resolve(process.cwd(), '../templates');
        const { setTemplatesDir } = await import('@lovable/engine');
        setTemplatesDir(templatesDir);

        await compileApp(newSpec, projectDir);

        return NextResponse.json({ success: true, project: newSpec.name });
    } catch (error) {
        console.error('Error updating app:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
