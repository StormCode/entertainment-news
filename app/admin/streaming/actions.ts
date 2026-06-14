"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { streamingAvailability } from "@/db/schema";
import { eq } from "drizzle-orm";

interface UpsertStreamingInput {
  id?: number;
  filmId: number;
  platform: string;
  isCurrentlyLive: boolean;
  availableFrom?: string; // ISO date string from <input type="date">
  availableUntil?: string;
  notes?: string;
}

export async function upsertStreaming(input: UpsertStreamingInput) {
  const { id, filmId, platform, isCurrentlyLive, availableFrom, availableUntil, notes } = input;

  const values = {
    film_id: filmId,
    platform: platform.trim(),
    is_currently_live: isCurrentlyLive,
    available_from: availableFrom ? new Date(availableFrom) : null,
    available_until: availableUntil ? new Date(availableUntil) : null,
    notes: notes?.trim() || null,
    updated_at: new Date(),
  };

  if (id) {
    await db
      .update(streamingAvailability)
      .set(values)
      .where(eq(streamingAvailability.id, id));
  } else {
    await db.insert(streamingAvailability).values(values);
  }

  revalidatePath("/");
  return { ok: true };
}

// Toggle is_currently_live synchronously (eng D9)
export async function toggleLive(id: number, isLive: boolean) {
  await db
    .update(streamingAvailability)
    .set({ is_currently_live: isLive, updated_at: new Date() })
    .where(eq(streamingAvailability.id, id));

  revalidatePath("/");
  return { ok: true };
}

export async function deleteStreaming(id: number) {
  await db
    .delete(streamingAvailability)
    .where(eq(streamingAvailability.id, id));

  revalidatePath("/");
  return { ok: true };
}
