import { NextRequest, NextResponse } from "next/server";
import { GENRE_SLUG_TO_LABEL } from "@/lib/constants/genres";
import { getEntriesByGenre } from "@/lib/queries/entries";

const PAGE_SIZE = 8;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const label = GENRE_SLUG_TO_LABEL[slug as keyof typeof GENRE_SLUG_TO_LABEL];
  if (!label) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1") || 1);
  const { items, hasNext } = await getEntriesByGenre(label, PAGE_SIZE, (page - 1) * PAGE_SIZE);
  return NextResponse.json({ items, hasNext });
}
