import { db } from "@/db";
import { entryChips } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { NewEntryChip } from "@/db/schema";
import { GENRE_LABELS, type GenreLabel } from "@/lib/constants/genres";

// DELETE + INSERT in a Postgres transaction to avoid race conditions
// between concurrent cron and on-save triggers (eng review D5)
export async function recomputeChips(
  entryId: number,
  chips: Omit<NewEntryChip, "entry_id">[]
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(entryChips).where(eq(entryChips.entry_id, entryId));
    if (chips.length > 0) {
      await tx.insert(entryChips).values(
        chips.map((c) => ({ ...c, entry_id: entryId }))
      );
    }
  });
}

// Kind-scoped: only touches genre chips, leaves streaming/festival/collaborator intact
export async function recomputeGenreChips(
  entryId: number,
  labels: string[]
): Promise<void> {
  const valid = labels.filter((l): l is GenreLabel =>
    (GENRE_LABELS as readonly string[]).includes(l)
  );
  await db.transaction(async (tx) => {
    await tx
      .delete(entryChips)
      .where(and(eq(entryChips.entry_id, entryId), eq(entryChips.kind, "genre")));
    if (valid.length > 0) {
      await tx.insert(entryChips).values(
        valid.map((label) => ({ entry_id: entryId, kind: "genre" as const, label, is_live: "false" }))
      );
    }
  });
}
