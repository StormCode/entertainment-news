import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const directors = pgTable("directors", {
  id:              serial("id").primaryKey(),
  name:            text("name").unique().notNull(),
  tmdb_person_id:  integer("tmdb_person_id").unique(),
  photo_url:       text("photo_url"),    // R2 URL; null until fetched
  created_at:      timestamp("created_at").defaultNow().notNull(),
  updated_at:      timestamp("updated_at").defaultNow().notNull(),
});

export type Director = typeof directors.$inferSelect;
export type NewDirector = typeof directors.$inferInsert;
