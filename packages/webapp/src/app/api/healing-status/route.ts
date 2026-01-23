import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { active, status, error, fix } = await req.json();

        global.__lovable_healing_active = active;
        global.__lovable_healing_status = status;
        global.__lovable_healing_error = error;
        global.__lovable_healing_fix = fix;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
