import { db } from "@/db";
import { entryChips } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NewEntryChip } from "@/db/schema";

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
