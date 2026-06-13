import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (err) {
    return NextResponse.json(
      { ok: false, db: "error", message: String(err) },
      { status: 503 }
    );
  }
}
