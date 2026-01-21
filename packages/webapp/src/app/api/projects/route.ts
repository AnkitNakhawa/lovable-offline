import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const WORKSPACES_DIR = path.resolve(process.cwd(), '../../workspaces');

export async function GET() {
    try {
        console.log('Listing projects in:', WORKSPACES_DIR);

        if (!fs.existsSync(WORKSPACES_DIR)) {
            fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
        }

        const files = fs.readdirSync(WORKSPACES_DIR, { withFileTypes: true });
        const projects = files
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error listing projects:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
