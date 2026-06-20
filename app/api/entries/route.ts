import { NextRequest, NextResponse } from "next/server";
import { getPublishedEntries } from "@/lib/queries/entries";

const PAGE_SIZE = 8;

export async function GET(req: NextRequest) {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1") || 1);
  const { items, hasNext } = await getPublishedEntries(PAGE_SIZE, (page - 1) * PAGE_SIZE);
  return NextResponse.json({ items, hasNext });
}
