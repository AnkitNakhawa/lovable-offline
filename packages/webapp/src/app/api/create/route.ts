import { NextResponse } from 'next/server';
import path from 'path';
import { generateAppSpec } from '@lovable/planner';
import { compileApp } from '@lovable/engine';

const WORKSPACES_DIR = path.resolve(process.cwd(), '../../workspaces');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        console.log('Creating project from prompt:', prompt);

        // 1. Generate Spec
        console.log('Generating spec...');
        const spec = await generateAppSpec(prompt);
        console.log('Spec generated:', spec.name);

        // 2. Determine Output Directory
        const projectDir = path.join(WORKSPACES_DIR, spec.name);
        console.log('Compiling to:', projectDir);

        // 3. Compile
        const templatesDir = path.resolve(process.cwd(), '../templates');
        const { setTemplatesDir } = await import('@lovable/engine');
        setTemplatesDir(templatesDir);

        await compileApp(spec, projectDir);
        console.log('Compilation complete');

        return NextResponse.json({ success: true, project: spec.name });
    } catch (error) {
        console.error('Error creating app:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
