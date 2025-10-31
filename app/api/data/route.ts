import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let query = "SELECT * FROM ivr WHERE 1=1";
    const params: any[] = [];

    if (channel) {
        query += " AND ivrCanal = ?";
        params.push(channel);
    }
    if (start && end) {
        query += " AND ivrDateStart BETWEEN ? AND ?";
        params.push(start, end);
    }
    query += " ORDER BY ivrDateStart DESC LIMIT 500";

    const [rows] = await db.execute(query, params);
    return NextResponse.json(rows);
}
