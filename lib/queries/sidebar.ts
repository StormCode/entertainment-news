import { db } from "@/db";
import { streamingAvailability, films, entries, entryChips } from "@/db/schema";
import { eq, and, desc, gt, lte, sql } from "drizzle-orm";

export type SidebarStreamItem = {
  filmTitle: string;
  filmTitleZh: string | null;
  platform: string;
  availableUntil: Date | null;
  notes: string | null;
};

// 即將上線 — not live yet, available_from is in the future
export async function getComingSoonStreaming(): Promise<SidebarStreamItem[]> {
  const now = new Date();
  const rows = await db
    .select({
      filmTitle: films.title,
      filmTitleZh: films.title_zh,
      platform: streamingAvailability.platform,
      availableUntil: streamingAvailability.available_from,
      notes: streamingAvailability.notes,
    })
    .from(streamingAvailability)
    .innerJoin(films, eq(streamingAvailability.film_id, films.id))
    .where(
      and(
        eq(streamingAvailability.is_currently_live, false),
        gt(streamingAvailability.available_from, now)
      )
    )
    .orderBy(streamingAvailability.available_from)
    .limit(5);
  return rows;
}

// 本週下架 — is_live=true and available_until within 7 days
export async function getExpiringSoonStreaming(): Promise<SidebarStreamItem[]> {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
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
    .where(
      and(
        eq(streamingAvailability.is_currently_live, true),
        gt(streamingAvailability.available_until, now),
        lte(streamingAvailability.available_until, sevenDaysLater)
      )
    )
    .orderBy(streamingAvailability.available_until)
    .limit(5);
  return rows;
}

// 進行中影展
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
