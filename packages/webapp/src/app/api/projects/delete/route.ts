import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';

const WORKSPACES_DIR = path.resolve(process.cwd(), '../../workspaces');

export async function POST(req: Request) {
    try {
        const { project } = await req.json();

        if (!project) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        // Security check
        if (project.includes('..') || project.includes('/') || project.includes('\\')) {
            return NextResponse.json({ error: 'Invalid project name' }, { status: 400 });
        }

        const projectDir = path.join(WORKSPACES_DIR, project);

        console.log(`Deleting project: ${project} at ${projectDir}`);

        if (await fs.pathExists(projectDir)) {
            await fs.remove(projectDir);
        }

        return NextResponse.json({ success: true, project });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
