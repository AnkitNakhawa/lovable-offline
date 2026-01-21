import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        logs: global.__lovable_server_logs || [],
        running: !!global.__lovable_dev_server
    });
}
