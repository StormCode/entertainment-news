import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { films } from "./films";

export const entries = pgTable("entries", {
  id:               serial("id").primaryKey(),
  slug:             text("slug").unique().notNull(),
  title:            text("title").notNull(),
  body_md:          text("body_md").notNull(),          // NO body_html — render via remark in server component (D13)
  primary_film_id:  integer("primary_film_id").references(() => films.id),
  backdrop_url:     text("backdrop_url"),               // null if R2 pipeline failed — show 「圖片待補」in admin
  manual_backdrop_url: text("manual_backdrop_url"),     // editor override
  is_published:     boolean("is_published").default(false).notNull(),
  is_hero_featured: boolean("is_hero_featured").default(false).notNull(),
  published_at:     timestamp("published_at"),
  created_at:       timestamp("created_at").defaultNow().notNull(),
  updated_at:       timestamp("updated_at").defaultNow().notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
