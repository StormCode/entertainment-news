import { db } from "@/db";
import { entries, entryChips } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { FESTIVAL_LABEL_TO_SLUG } from "@/lib/constants/festivals";

export type FestivalSummary = {
  label: string;
  slug: string;
  count: number;
};

export async function getFestivalSummaries(): Promise<FestivalSummary[]> {
  const rows = await db
    .select({
      label: entryChips.label,
      count: sql<number>`count(*)::int`,
    })
    .from(entryChips)
    .innerJoin(entries, eq(entryChips.entry_id, entries.id))
    .where(and(eq(entryChips.kind, "festival"), eq(entries.is_published, true)))
    .groupBy(entryChips.label)
    .orderBy(sql`count(*) desc`);

  return rows
    .map((r) => ({
      label: r.label,
      slug: FESTIVAL_LABEL_TO_SLUG[r.label as keyof typeof FESTIVAL_LABEL_TO_SLUG] ?? null,
      count: r.count,
    }))
    .filter((r) => r.slug !== null) as FestivalSummary[];
}
