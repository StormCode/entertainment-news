import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { entries } from "./entries";

// kind values: 'streaming' | 'festival' | 'collaborator' | 'genre'
// festival: manual only in v0 (no auto-compute until v0.1)
// genre: saved per-kind (DELETE WHERE kind='genre' + INSERT), does not affect other kinds
export const entryChips = pgTable("entry_chips", {
  id:         serial("id").primaryKey(),
  entry_id:   integer("entry_id").notNull().references(() => entries.id, { onDelete: "cascade" }),
  kind:       text("kind", { enum: ["streaming", "festival", "collaborator", "genre"] }).notNull(),
  label:      text("label").notNull(),
  is_live:    text("is_live").default("false"),  // for streaming chips
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type EntryChip = typeof entryChips.$inferSelect;
export type NewEntryChip = typeof entryChips.$inferInsert;
