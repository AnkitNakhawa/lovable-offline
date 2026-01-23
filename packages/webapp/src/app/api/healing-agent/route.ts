import { NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

declare global {
    var __lovable_healing_agent: ChildProcess | undefined;
}

export async function POST(req: Request) {
    try {
        const { action, project } = await req.json();

        if (action === 'start') {
            // Stop existing agent if running
            if (global.__lovable_healing_agent) {
                try {
                    global.__lovable_healing_agent.kill();
                } catch (e) { }
                global.__lovable_healing_agent = undefined;
            }

            if (!project) {
                return NextResponse.json({ error: 'Project name required' }, { status: 400 });
            }

            // Start the healing agent
            const agentPath = path.resolve(process.cwd(), '../../packages/agent/dist/index.js');
            const agent = spawn('node', [agentPath, project], {
                cwd: path.resolve(process.cwd(), '../..'),
                detached: false,
                stdio: 'pipe'
            });

            agent.stdout?.on('data', (data) => {
                console.log(`[Healing Agent] ${data.toString()}`);
            });

            agent.stderr?.on('data', (data) => {
                console.error(`[Healing Agent Error] ${data.toString()}`);
            });

            agent.on('exit', (code) => {
                console.log(`[Healing Agent] Exited with code ${code}`);
                global.__lovable_healing_agent = undefined;
            });

            global.__lovable_healing_agent = agent;

            return NextResponse.json({
                success: true,
                message: `Healing agent started for ${project}`,
                pid: agent.pid
            });

        } else if (action === 'stop') {
            if (global.__lovable_healing_agent) {
                try {
                    global.__lovable_healing_agent.kill();
                    global.__lovable_healing_agent = undefined;
                    return NextResponse.json({ success: true, message: 'Healing agent stopped' });
                } catch (e) {
                    return NextResponse.json({ error: String(e) }, { status: 500 });
                }
            } else {
                return NextResponse.json({ success: true, message: 'No agent running' });
            }
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        running: !!global.__lovable_healing_agent,
        pid: global.__lovable_healing_agent?.pid
    });
}
