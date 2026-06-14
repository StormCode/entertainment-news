import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Written by GHA workflows via POST /api/pipeline-health at end of each job
// status: 'success' | 'failure'
export const pipelineHealth = pgTable("pipeline_health", {
  name:        text("name").primaryKey(),
  last_run_at: timestamp("last_run_at", { withTimezone: true }).notNull(),
  status:      text("status", { enum: ["success", "failure"] }).notNull(),
});

export type PipelineHealth = typeof pipelineHealth.$inferSelect;
