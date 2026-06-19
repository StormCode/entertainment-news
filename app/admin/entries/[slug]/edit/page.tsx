import { notFound } from "next/navigation";
import { db } from "@/db";
import { entries, films, entryChips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { EditEntryForm } from "./EditEntryForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditEntryPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const rows = await db
    .select()
    .from(entries)
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(eq(entries.slug, decodedSlug))
    .limit(1);

  if (!rows[0]) notFound();

  const { entries: entry, films: film } = rows[0];

  const chips = await db
    .select()
    .from(entryChips)
    .where(eq(entryChips.entry_id, entry.id));

  return (
    <EditEntryForm
      entry={{
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        body_md: entry.body_md,
        manual_backdrop_url: entry.manual_backdrop_url,
        backdrop_url: entry.backdrop_url,
        image_credit: entry.image_credit ?? null,
        is_published: entry.is_published,
        is_hero_featured: entry.is_hero_featured,
        published_at: entry.published_at?.toISOString() ?? null,
      }}
      film={film ? {
        id: film.id,
        tmdb_id: film.tmdb_id,
        title: film.title,
        title_zh: film.title_zh,
        director: film.director,
        runtime_min: film.runtime_min,
        release_year: film.release_year,
        poster_url: film.poster_url,
        backdrop_url: film.backdrop_url,
      } : null}
      chips={chips.map((c) => ({ label: c.label, kind: c.kind, is_live: c.is_live }))}
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  return { title: `編輯：${decodedSlug}` };
}
