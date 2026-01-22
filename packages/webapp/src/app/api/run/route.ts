import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';

const WORKSPACES_DIR = path.resolve(process.cwd(), '../../workspaces');

declare global {
    var __lovable_dev_server: ChildProcess | undefined;
    var __lovable_server_logs: string[];
    var __lovable_project: string | undefined;
    var __lovable_url: string | undefined;
}

function findAvailablePort(startPort: number): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const { port } = server.address() as net.AddressInfo;
            server.close(() => resolve(port));
        });
        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
}

export async function POST(req: Request) {
    try {
        const { project } = await req.json();
        if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });

        const projectDir = path.join(WORKSPACES_DIR, project);

        if (global.__lovable_dev_server) {
            try {
                if (global.__lovable_dev_server.pid) {
                    process.kill(-global.__lovable_dev_server.pid);
                }
            } catch (e) {
                global.__lovable_dev_server.kill();
            }
            global.__lovable_dev_server = undefined;
            global.__lovable_project = undefined;
            global.__lovable_url = undefined;
        }

        const nodeModules = path.join(projectDir, 'node_modules');
        const hasDeps = fs.existsSync(nodeModules);

        let prismaCmd = 'npx prisma';
        if (hasDeps) {
            const localBin = path.join(nodeModules, '.bin', 'prisma');
            if (fs.existsSync(localBin)) prismaCmd = localBin;
        }

        const port = await findAvailablePort(3000);

        let command = `${prismaCmd} generate && npm run dev -- -p ${port}`;
        if (!hasDeps) {
            command = `npm install && npx prisma generate && npm run dev -- -p ${port}`;
        }

        const child = spawn(command, {
            cwd: projectDir,
            shell: true,
            detached: true,
            stdio: 'pipe'
        });

        global.__lovable_server_logs = [];

        const log = (data: Buffer) => {
            const line = data.toString();
            global.__lovable_server_logs.push(line);
            if (global.__lovable_server_logs.length > 500) global.__lovable_server_logs.shift();
        };

        child.stdout?.on('data', log);
        child.stderr?.on('data', log);

        global.__lovable_dev_server = child;
        global.__lovable_project = project;
        global.__lovable_url = `http://localhost:${port}`;

        const estTime = hasDeps ? 3000 : 45000;

        return NextResponse.json({
            success: true,
            message: hasDeps ? `Starting server on port ${port}...` : `Installing dependencies (~45s)...`,
            estimatedTimeMs: estTime,
            url: `http://localhost:${port}`
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
