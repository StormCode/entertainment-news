import { db } from "@/db";
import { streamingAvailability, films, entries, entryChips } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export type SidebarStreamItem = {
  filmTitle: string;
  filmTitleZh: string | null;
  platform: string;
  availableUntil: Date | null;
  notes: string | null;
};

// 即將上線 (coming soon — not live yet, has available_from)
export async function getComingSoonStreaming(): Promise<SidebarStreamItem[]> {
  const rows = await db
    .select({
      filmTitle: films.title,
      filmTitleZh: films.title_zh,
      platform: streamingAvailability.platform,
      availableUntil: streamingAvailability.available_until,
      notes: streamingAvailability.notes,
    })
    .from(streamingAvailability)
    .innerJoin(films, eq(streamingAvailability.film_id, films.id))
    .where(eq(streamingAvailability.is_currently_live, false))
    .limit(5);
  return rows;
}

// 本週下架 (expiring soon — is_live=true, available_until within 7 days)
export async function getExpiringSoonStreaming(): Promise<SidebarStreamItem[]> {
  const rows = await db
    .select({
      filmTitle: films.title,
      filmTitleZh: films.title_zh,
      platform: streamingAvailability.platform,
      availableUntil: streamingAvailability.available_until,
      notes: streamingAvailability.notes,
    })
    .from(streamingAvailability)
    .innerJoin(films, eq(streamingAvailability.film_id, films.id))
    .where(eq(streamingAvailability.is_currently_live, true))
    .limit(5);
  return rows;
}

// 進行中影展 (festival chips with label matching current festivals)
export type FestivalItem = { label: string; entrySlug: string; entryTitle: string };

export async function getActiveFestivals(): Promise<FestivalItem[]> {
  const rows = await db
    .select({
      label: entryChips.label,
      entrySlug: entries.slug,
      entryTitle: entries.title,
    })
    .from(entryChips)
    .innerJoin(entries, and(
      eq(entryChips.entry_id, entries.id),
      eq(entries.is_published, true)
    ))
    .where(eq(entryChips.kind, "festival"))
    .orderBy(desc(entries.published_at))
    .limit(5);
  return rows;
}
