import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const WORKSPACES_DIR = path.resolve(process.cwd(), '../../workspaces');

export async function POST(req: Request) {
    try {
        const { project, filePath } = await req.json();

        if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });

        const projectDir = path.join(WORKSPACES_DIR, project);

        // Default to listing files if no path provided
        if (!filePath) {
            if (!fs.existsSync(projectDir)) return NextResponse.json({ files: [] });

            const files = await getFilesRecursive(projectDir);
            return NextResponse.json({ files });
        }

        // Read specific file
        const fullPath = path.join(projectDir, filePath);
        if (!fs.existsSync(fullPath)) return NextResponse.json({ error: 'File not found' }, { status: 404 });

        const content = fs.readFileSync(fullPath, 'utf-8');
        return NextResponse.json({ content });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

async function getFilesRecursive(dir: string, base: string = ''): Promise<string[]> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const relativePath = path.join(base, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
            files.push(...await getFilesRecursive(path.join(dir, entry.name), relativePath));
        } else {
            files.push(relativePath);
        }
    }
    return files;
}
