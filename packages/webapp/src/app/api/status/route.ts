import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        logs: global.__lovable_server_logs || [],
        running: !!global.__lovable_dev_server,
        project: global.__lovable_project,
        url: global.__lovable_url,
        healing: {
            active: global.__lovable_healing_active || false,
            currentError: global.__lovable_healing_error || null,
            currentFix: global.__lovable_healing_fix || null,
            status: global.__lovable_healing_status || 'idle'
        }
    });
}
