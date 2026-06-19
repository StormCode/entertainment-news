import { NextRequest, NextResponse } from "next/server";
import { fetchTmdbPosters } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("tmdbId") ?? "";
  const tmdbId = parseInt(raw, 10);
  if (isNaN(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "invalid tmdbId" }, { status: 400 });
  }
  const posters = await fetchTmdbPosters(tmdbId);
  return NextResponse.json({ posters });
}
