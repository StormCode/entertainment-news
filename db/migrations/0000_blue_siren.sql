CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"body_md" text NOT NULL,
	"primary_film_id" integer,
	"backdrop_url" text,
	"manual_backdrop_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_hero_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "entry_chips" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"is_live" text DEFAULT 'false',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "films" (
	"id" serial PRIMARY KEY NOT NULL,
	"tmdb_id" integer,
	"title" text NOT NULL,
	"title_zh" text,
	"director" text,
	"runtime_min" integer,
	"release_year" integer,
	"backdrop_url" text,
	"poster_url" text,
	"tmdb_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "films_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "streaming_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"film_id" integer NOT NULL,
	"platform" text NOT NULL,
	"is_currently_live" boolean DEFAULT false NOT NULL,
	"available_from" timestamp,
	"available_until" timestamp,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_primary_film_id_films_id_fk" FOREIGN KEY ("primary_film_id") REFERENCES "public"."films"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_chips" ADD CONSTRAINT "entry_chips_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaming_availability" ADD CONSTRAINT "streaming_availability_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;