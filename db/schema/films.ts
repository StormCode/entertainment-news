import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const films = pgTable("films", {
  id:           serial("id").primaryKey(),
  tmdb_id:      integer("tmdb_id").unique(),
  title:        text("title").notNull(),
  title_zh:     text("title_zh"),               // Chinese title
  director:     text("director"),
  runtime_min:  integer("runtime_min"),
  release_year: integer("release_year"),
  backdrop_url: text("backdrop_url"),           // R2 URL, null if pipeline failed
  poster_url:   text("poster_url"),             // R2 URL, null if pipeline failed
  tmdb_data:    text("tmdb_data"),              // raw JSON snapshot
  created_at:   timestamp("created_at").defaultNow().notNull(),
  updated_at:   timestamp("updated_at").defaultNow().notNull(),
});

export type Film = typeof films.$inferSelect;
export type NewFilm = typeof films.$inferInsert;
