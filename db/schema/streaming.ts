import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { films } from "./films";

export const streamingAvailability = pgTable("streaming_availability", {
  id:               serial("id").primaryKey(),
  film_id:          integer("film_id").notNull().references(() => films.id, { onDelete: "cascade" }),
  platform:         text("platform").notNull(),     // "Netflix", "MUBI", etc.
  is_currently_live: boolean("is_currently_live").default(false).notNull(),
  available_from:   timestamp("available_from"),
  available_until:  timestamp("available_until"),
  notes:            text("notes"),
  updated_at:       timestamp("updated_at").defaultNow().notNull(),
});

export type StreamingAvailability = typeof streamingAvailability.$inferSelect;
export type NewStreamingAvailability = typeof streamingAvailability.$inferInsert;
