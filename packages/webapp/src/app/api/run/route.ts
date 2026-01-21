import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';

const WORKSPACES_DIR = path.resolve(process.cwd(), '../../workspaces');

declare global {
    var __lovable_dev_server: ChildProcess | undefined;
    var __lovable_server_logs: string[];
}

export async function POST(req: Request) {
    try {
        const { project } = await req.json();
        if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });

        const projectDir = path.join(WORKSPACES_DIR, project);

        // 1. Kill existing
        if (global.__lovable_dev_server) {
            console.log('[API] Killing active server...');
            try {
                if (global.__lovable_dev_server.pid) {
                    process.kill(-global.__lovable_dev_server.pid);
                }
            } catch (e) {
                global.__lovable_dev_server.kill();
            }
            global.__lovable_dev_server = undefined;
        }

        // 2. Check dependencies
        const nodeModules = path.join(projectDir, 'node_modules');
        const hasDeps = fs.existsSync(nodeModules);

        let prismaCmd = 'npx prisma';
        if (hasDeps) {
            const localBin = path.join(nodeModules, '.bin', 'prisma');
            if (fs.existsSync(localBin)) prismaCmd = localBin;
        }

        // Use a simpler command structure to avoid shell issues if possible, but && requires shell.
        let command = `${prismaCmd} generate && npm run dev -- -p 3000`;
        if (!hasDeps) {
            command = 'npm install && npx prisma generate && npm run dev -- -p 3000';
        }

        console.log(`[API] Launching ${project}: ${command}`);

        const child = spawn(command, {
            cwd: projectDir,
            shell: true,
            detached: true,
            stdio: 'pipe'
        });

        global.__lovable_server_logs = [];

        // Log output
        const log = (data: Buffer) => {
            const line = data.toString();
            console.log(`[${project}] ${line}`);
            global.__lovable_server_logs.push(line);
            if (global.__lovable_server_logs.length > 500) global.__lovable_server_logs.shift();
        };

        child.stdout?.on('data', log);
        child.stderr?.on('data', log);

        global.__lovable_dev_server = child;

        const estTime = hasDeps ? 3000 : 45000;

        return NextResponse.json({
            success: true,
            message: hasDeps ? 'Starting server... (give it a few seconds)' : 'Installing dependencies (~45s)...',
            estimatedTimeMs: estTime
        });

    } catch (error) {
        console.error('Run error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
