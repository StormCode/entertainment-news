CREATE TABLE "directors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tmdb_person_id" integer,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "directors_name_unique" UNIQUE("name"),
	CONSTRAINT "directors_tmdb_person_id_unique" UNIQUE("tmdb_person_id")
);
