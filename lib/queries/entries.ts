import { db } from "@/db";
import { entries, films, entryChips } from "@/db/schema";
import { eq, desc, and, inArray, ne, or, ilike } from "drizzle-orm";

export type EntryWithFilm = {
  id: number;
  slug: string;
  title: string;
  backdropUrl: string | null;
  publishedAt: Date | null;
  film: {
    title: string;
    titleZh: string | null;
    director: string | null;
    runtimeMin: number | null;
    posterUrl: string | null;
  } | null;
  chips: Array<{ label: string; kind: string; isLive: string | null }>;
};

export async function getPublishedEntries(limit = 20): Promise<EntryWithFilm[]> {
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
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(eq(entries.is_published, true))
    .orderBy(desc(entries.published_at))
    .limit(limit);

  // Fetch chips per entry in one query
  const entryIds = rows.map((r) => r.id);
  const allChips =
    entryIds.length > 0
      ? await db
          .select()
          .from(entryChips)
          .where(inArray(entryChips.entry_id, entryIds))
      : [];

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    backdropUrl: r.backdropUrl ?? r.manualBackdropUrl,
    publishedAt: r.publishedAt,
    film: r.filmTitle
      ? {
          title: r.filmTitle,
          titleZh: r.filmTitleZh,
          director: r.filmDirector,
          runtimeMin: r.filmRuntime,
          posterUrl: r.filmPosterUrl,
        }
      : null,
    chips: allChips
      .filter((c) => c.entry_id === r.id)
      .map((c) => ({ label: c.label, kind: c.kind, isLive: c.is_live })),
  }));
}

export async function getHeroEntry(): Promise<EntryWithFilm | null> {
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
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(eq(entries.is_published, true))
    .orderBy(desc(entries.is_hero_featured), desc(entries.published_at))
    .limit(1);

  if (!rows[0]) return null;

  const genreChips = await db
    .select()
    .from(entryChips)
    .where(and(eq(entryChips.entry_id, rows[0].id), eq(entryChips.kind, "genre")));

  const r = rows[0];
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    backdropUrl: r.manualBackdropUrl ?? r.backdropUrl,  // manual takes priority
    publishedAt: r.publishedAt,
    film: r.filmTitle
      ? {
          title: r.filmTitle,
          titleZh: r.filmTitleZh,
          director: r.filmDirector,
          runtimeMin: r.filmRuntime,
          posterUrl: r.filmPosterUrl,
        }
      : null,
    chips: genreChips.map((c) => ({ label: c.label, kind: c.kind, isLive: c.is_live })),
  };
}

export async function getHeroEntries(): Promise<EntryWithFilm[]> {
  // featured first, then newest — always returns up to 5 regardless of is_hero_featured count
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
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(eq(entries.is_published, true))
    .orderBy(desc(entries.is_hero_featured), desc(entries.published_at))
    .limit(5);

  const entryIds = rows.map((r) => r.id);
  const allChips =
    entryIds.length > 0
      ? await db
          .select()
          .from(entryChips)
          .where(inArray(entryChips.entry_id, entryIds))
      : [];

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    backdropUrl: r.manualBackdropUrl ?? r.backdropUrl,
    publishedAt: r.publishedAt,
    film: r.filmTitle
      ? {
          title: r.filmTitle,
          titleZh: r.filmTitleZh,
          director: r.filmDirector,
          runtimeMin: r.filmRuntime,
          posterUrl: r.filmPosterUrl,
        }
      : null,
    chips: allChips
      .filter((c) => c.entry_id === r.id)
      .map((c) => ({ label: c.label, kind: c.kind, isLive: c.is_live })),
  }));
}

export async function getEntriesByGenre(genreLabel: string): Promise<EntryWithFilm[]> {
  const matching = await db
    .select({ entry_id: entryChips.entry_id })
    .from(entryChips)
    .where(and(eq(entryChips.kind, "genre"), eq(entryChips.label, genreLabel)));

  if (matching.length === 0) return [];

  const ids = matching.map((r) => r.entry_id);

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
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(and(eq(entries.is_published, true), inArray(entries.id, ids)))
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
    film: r.filmTitle
      ? {
          title: r.filmTitle,
          titleZh: r.filmTitleZh,
          director: r.filmDirector,
          runtimeMin: r.filmRuntime,
          posterUrl: r.filmPosterUrl,
        }
      : null,
    chips: allChips
      .filter((c) => c.entry_id === r.id)
      .map((c) => ({ label: c.label, kind: c.kind, isLive: c.is_live })),
  }));
}

export async function getEntriesByDirector(director: string, excludeEntryId: number): Promise<EntryWithFilm[]> {
  const rows = await db
    .select({
      id: entries.id,
      slug: entries.slug,
      title: entries.title,
      backdropUrl: entries.backdrop_url,
      publishedAt: entries.published_at,
      filmTitle: films.title,
      filmTitleZh: films.title_zh,
      filmDirector: films.director,
      filmRuntimeMin: films.runtime_min,
      filmPosterUrl: films.poster_url,
    })
    .from(entries)
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(
      and(
        eq(entries.is_published, true),
        eq(films.director, director),
        ne(entries.id, excludeEntryId)
      )
    )
    .orderBy(desc(entries.published_at))
    .limit(4);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    backdropUrl: r.backdropUrl,
    publishedAt: r.publishedAt,
    film: r.filmTitle
      ? {
          title: r.filmTitle,
          titleZh: r.filmTitleZh,
          director: r.filmDirector,
          runtimeMin: r.filmRuntimeMin,
          posterUrl: r.filmPosterUrl,
        }
      : null,
    chips: [],
  }));
}

export async function searchEntries(query: string): Promise<EntryWithFilm[]> {
  if (!query.trim()) return [];
  const q = `%${query.trim()}%`;
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
      filmRuntimeMin: films.runtime_min,
      filmPosterUrl: films.poster_url,
    })
    .from(entries)
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(
      and(
        eq(entries.is_published, true),
        or(
          ilike(entries.title, q),
          ilike(entries.body_md, q),
          ilike(films.title, q),
          ilike(films.title_zh, q),
        )
      )
    )
    .orderBy(desc(entries.published_at))
    .limit(20);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    backdropUrl: r.manualBackdropUrl ?? r.backdropUrl,
    publishedAt: r.publishedAt,
    film: r.filmTitle
      ? {
          title: r.filmTitle,
          titleZh: r.filmTitleZh,
          director: r.filmDirector,
          runtimeMin: r.filmRuntimeMin,
          posterUrl: r.filmPosterUrl,
        }
      : null,
    chips: [],
  }));
}

export async function getEntryBySlug(slug: string) {
  const row = await db
    .select()
    .from(entries)
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(and(eq(entries.slug, slug), eq(entries.is_published, true)))
    .limit(1);

  if (!row[0]) return null;

  const chips = await db
    .select()
    .from(entryChips)
    .where(eq(entryChips.entry_id, row[0].entries.id));

  return { entry: row[0].entries, film: row[0].films, chips };
}
