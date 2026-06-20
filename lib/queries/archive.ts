import { db } from "@/db";
import { entries, films } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";

export type ArchiveEntry = {
  slug: string;
  entryTitle: string;
  filmTitle: string;
  filmTitleZh: string | null;
  director: string | null;
  releaseYear: number;
};

export type ArchiveDecade = {
  decade: number;
  label: string;
  entries: ArchiveEntry[];
};

export async function getArchiveByDecade(): Promise<ArchiveDecade[]> {
  const rows = await db
    .select({
      slug: entries.slug,
      entryTitle: entries.title,
      filmTitle: films.title,
      filmTitleZh: films.title_zh,
      director: films.director,
      releaseYear: films.release_year,
    })
    .from(entries)
    .innerJoin(films, eq(entries.primary_film_id, films.id))
    .where(and(eq(entries.is_published, true), isNotNull(films.release_year)))
    .orderBy(desc(films.release_year), desc(entries.published_at));

  const decadeMap = new Map<number, ArchiveEntry[]>();

  for (const r of rows) {
    if (!r.releaseYear) continue;
    const decade = Math.floor(r.releaseYear / 10) * 10;
    if (!decadeMap.has(decade)) decadeMap.set(decade, []);
    decadeMap.get(decade)!.push({
      slug: r.slug,
      entryTitle: r.entryTitle,
      filmTitle: r.filmTitle,
      filmTitleZh: r.filmTitleZh,
      director: r.director,
      releaseYear: r.releaseYear,
    });
  }

  return Array.from(decadeMap.entries())
    .sort(([a], [b]) => b - a)
    .map(([decade, entries]) => ({
      decade,
      label: `${decade}s`,
      entries,
    }));
}
