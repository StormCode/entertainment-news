"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { films, entries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchTmdbFilm } from "@/lib/tmdb";
import { recomputeChips } from "@/lib/chips/recompute";
import { uploadFilmImages } from "@/lib/images/r2-upload";

// Fetch TMDB data for admin autofill
export async function fetchFilmData(
  tmdbUrl: string
): Promise<{ error: string } | { film: NonNullable<Awaited<ReturnType<typeof fetchTmdbFilm>>> }> {
  const film = await fetchTmdbFilm(tmdbUrl);
  if (!film) return { error: "找不到影片，請確認 TMDB 網址" };
  return { film };
}

interface SaveEntryInput {
  tmdbUrl?: string;
  titleZh?: string;
  entryTitle: string;
  bodyMd: string;
  publish: boolean;
}

export async function saveEntry(input: SaveEntryInput) {
  const { tmdbUrl, titleZh, entryTitle, bodyMd, publish } = input;

  let filmId: number | null = null;

  // Upsert film if TMDB URL provided
  if (tmdbUrl) {
    const tmdbFilm = await fetchTmdbFilm(tmdbUrl);
    if (tmdbFilm) {
      const existing = await db
        .select({ id: films.id })
        .from(films)
        .where(eq(films.tmdb_id, tmdbFilm.tmdbId))
        .limit(1);

      if (existing[0]) {
        filmId = existing[0].id;
      } else {
        const inserted = await db
          .insert(films)
          .values({
            tmdb_id: tmdbFilm.tmdbId,
            title: tmdbFilm.title,
            title_zh: titleZh ?? null,
            director: tmdbFilm.director,
            runtime_min: tmdbFilm.runtimeMin,
            release_year: tmdbFilm.releaseYear,
            backdrop_url: tmdbFilm.backdropPath,  // raw TMDB URL; R2 upload in background
            poster_url: tmdbFilm.posterPath,
            tmdb_data: tmdbFilm.rawJson,
          })
          .returning({ id: films.id });
        filmId = inserted[0].id;

        // Kick off R2 upload in background — entry saves even if this fails (eng D14)
        uploadFilmImages({
          tmdbId: tmdbFilm.tmdbId,
          backdropTmdbPath: tmdbFilm.backdropPath,
          posterTmdbPath: tmdbFilm.posterPath,
        })
          .then(async ({ heroUrl, posterUrl }) => {
            if (heroUrl || posterUrl) {
              await db
                .update(films)
                .set({
                  ...(heroUrl ? { backdrop_url: heroUrl } : {}),
                  ...(posterUrl ? { poster_url: posterUrl } : {}),
                })
                .where(eq(films.id, filmId!));
            }
          })
          .catch(() => {
            // R2 failure is non-fatal — admin shows "圖片待補" (eng D14)
          });
      }
    }
  }

  // Generate slug from entry title
  const slug = entryTitle
    .toLowerCase()
    .replace(/[《》「」【】、，。！？]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9一-鿿-]/g, "")
    .slice(0, 60)
    + `-${Date.now().toString(36)}`;

  const [entry] = await db
    .insert(entries)
    .values({
      slug,
      title: entryTitle,
      body_md: bodyMd,
      primary_film_id: filmId,
      is_published: publish,
      published_at: publish ? new Date() : null,
    })
    .returning({ id: entries.id, slug: entries.slug });

  if (publish) {
    // Trigger ISR cache invalidation on publish (eng review D3)
    revalidatePath("/");
    revalidatePath(`/entries/${entry.slug}`);
    revalidatePath("/rss.xml");
    redirect(`/entries/${entry.slug}`);
  }

  return { entryId: entry.id, slug: entry.slug };
}
