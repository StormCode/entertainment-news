import { db } from "@/db";
import { entries, films, entryChips, directors } from "@/db/schema";
import { eq, desc, and, isNotNull, inArray, sql } from "drizzle-orm";
import { directorToSlug } from "@/lib/directors";
import type { EntryWithFilm } from "./entries";

export type DirectorSummary = {
  name: string;
  slug: string;
  entryCount: number;
  photoUrl: string | null;
};

export async function getDirectors(): Promise<DirectorSummary[]> {
  const rows = await db
    .select({
      director: films.director,
      entryCount: sql<number>`cast(count(${entries.id}) as int)`,
      photoUrl: directors.photo_url,
    })
    .from(entries)
    .innerJoin(films, eq(entries.primary_film_id, films.id))
    .leftJoin(directors, eq(directors.name, films.director))
    .where(and(eq(entries.is_published, true), isNotNull(films.director)))
    .groupBy(films.director, directors.photo_url)
    .orderBy(sql`count(${entries.id}) desc`, films.director);

  return rows
    .filter((r) => r.director !== null)
    .map((r) => ({
      name: r.director!,
      slug: directorToSlug(r.director!),
      entryCount: r.entryCount,
      photoUrl: r.photoUrl,
    }));
}

export async function getEntriesByDirectorName(directorName: string): Promise<EntryWithFilm[]> {
  const rows = await db
    .select({
      id: entries.id,
      slug: entries.slug,
      title: entries.title,
      backdropUrl: entries.backdrop_url,
      manualBackdropUrl: entries.manual_backdrop_url,
      publishedAt: entries.published_at,
      filmTitle: films.title,
      filmTitleZh: films.title_zh,
      filmDirector: films.director,
      filmRuntime: films.runtime_min,
      filmPosterUrl: films.poster_url,
    })
    .from(entries)
    .innerJoin(films, eq(entries.primary_film_id, films.id))
    .where(and(eq(entries.is_published, true), eq(films.director, directorName)))
    .orderBy(desc(entries.published_at));

  if (rows.length === 0) return [];

  const allChips = await db
    .select()
    .from(entryChips)
    .where(inArray(entryChips.entry_id, rows.map((r) => r.id)));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    backdropUrl: r.manualBackdropUrl ?? r.backdropUrl,
    publishedAt: r.publishedAt,
    film: {
      title: r.filmTitle,
      titleZh: r.filmTitleZh,
      director: r.filmDirector,
      runtimeMin: r.filmRuntime,
      posterUrl: r.filmPosterUrl,
    },
    chips: allChips
      .filter((c) => c.entry_id === r.id)
      .map((c) => ({ label: c.label, kind: c.kind, isLive: c.is_live })),
  }));
}

export async function resolveDirectorSlug(slug: string): Promise<string | null> {
  const directors = await getDirectors();
  return directors.find((d) => d.slug === slug)?.name ?? null;
}
