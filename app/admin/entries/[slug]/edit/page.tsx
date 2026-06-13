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

  const rows = await db
    .select()
    .from(entries)
    .leftJoin(films, eq(entries.primary_film_id, films.id))
    .where(eq(entries.slug, slug))
    .limit(1);

  if (!rows[0]) notFound();

  const { entries: entry, films: film } = rows[0];

  const chips = await db
    .select()
    .from(entryChips)
    .where(eq(entryChips.entry_id, entry.id));

  return (
    <EditEntryForm
      entry={entry}
      film={film}
      chips={chips.map((c) => ({ label: c.label, kind: c.kind, is_live: c.is_live }))}
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `編輯：${slug}` };
}
