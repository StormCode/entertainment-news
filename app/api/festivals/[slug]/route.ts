import { NextRequest, NextResponse } from "next/server";
import { FESTIVAL_SLUG_TO_LABEL } from "@/lib/constants/festivals";
import { getEntriesByChip } from "@/lib/queries/entries";

const PAGE_SIZE = 8;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const label = FESTIVAL_SLUG_TO_LABEL[slug as keyof typeof FESTIVAL_SLUG_TO_LABEL];
  if (!label) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1") || 1);
  const { items, hasNext } = await getEntriesByChip("festival", label, PAGE_SIZE, (page - 1) * PAGE_SIZE);
  return NextResponse.json({ items, hasNext });
}
