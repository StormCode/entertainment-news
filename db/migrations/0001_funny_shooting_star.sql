CREATE TABLE "pipeline_health" (
	"name" text PRIMARY KEY NOT NULL,
	"last_run_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL
);
