#!/usr/bin/env bun
/**
 * Populates the directors table from films.director, fetches TMDB person photos,
 * uploads to R2, and stores the URL.
 *
 * Usage: bun scripts/seed-directors.ts
 */

import { db } from "../db";
import { films, directors } from "../db/schema";
import { isNotNull, sql, eq } from "drizzle-orm";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w300";
const BUCKET = process.env.R2_BUCKET ?? "entertainment-news";
const PUBLIC_BASE = process.env.R2_PUBLIC_URL ?? "";

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

async function fetchDirectorFromCredits(directorName: string): Promise<{ id: number; profilePath: string | null } | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not set");

  // Look up all films for this director, use the first one's credits to get
  // the canonical TMDB person ID — more accurate than name-based person search
  const filmRows = await db
    .select({ tmdb_id: films.tmdb_id })
    .from(films)
    .where(eq(films.director, directorName));

  for (const film of filmRows) {
    if (!film.tmdb_id) continue;
    const res = await fetch(`${TMDB_BASE}/movie/${film.tmdb_id}/credits?api_key=${apiKey}`);
    if (!res.ok) continue;
    const data = await res.json();
    const person = data.crew?.find(
      (c: { job: string; name: string; id: number; profile_path: string | null }) =>
        c.job === "Director" && c.name === directorName
    );
    if (person) return { id: person.id, profilePath: person.profile_path ?? null };
  }
  return null;
}

async function uploadPhoto(tmdbPersonId: number, profilePath: string): Promise<string | null> {
  try {
    const res = await fetch(`${TMDB_IMAGE_BASE}${profilePath}`);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const key = `directors/${tmdbPersonId}/photo.jpg`;
    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buf,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return `${PUBLIC_BASE}/${key}`;
  } catch (e) {
    console.error("  upload failed:", e);
    return null;
  }
}

async function main() {
  const skipExisting = !process.argv.includes("--force");

  // Get distinct director names from films
  const rows = await db
    .selectDistinct({ name: films.director })
    .from(films)
    .where(isNotNull(films.director))
    .orderBy(films.director);

  const names = rows.map((r) => r.name!).filter(Boolean);
  console.log(`Found ${names.length} directors:`, names);

  // Load existing director rows to skip those already fully resolved
  const existing = await db.select().from(directors);
  const existingMap = new Map(existing.map((d) => [d.name, d]));

  for (const name of names) {
    if (skipExisting) {
      const d = existingMap.get(name);
      if (d?.photo_url && d?.tmdb_person_id) {
        console.log(`\nSkipping (already resolved): ${name}`);
        continue;
      }
    }

    console.log(`\nProcessing: ${name}`);

    // Upsert director row
    await db
      .insert(directors)
      .values({ name, updated_at: new Date() })
      .onConflictDoNothing();

    // Fetch TMDB person via film credits (avoids name-search false matches)
    const person = await fetchDirectorFromCredits(name);
    if (!person) {
      console.log(`  TMDB: not found`);
      continue;
    }
    console.log(`  TMDB person_id: ${person.id}, profile: ${person.profilePath}`);

    let photoUrl: string | null = null;
    if (person.profilePath) {
      photoUrl = await uploadPhoto(person.id, person.profilePath);
      if (photoUrl) {
        console.log(`  R2 upload: ${photoUrl}`);
      } else {
        // Fall back to TMDB CDN (same pattern as films.poster_url)
        photoUrl = `${TMDB_IMAGE_BASE}${person.profilePath}`;
        console.log(`  R2 failed, using TMDB CDN: ${photoUrl}`);
      }
    }

    await db
      .update(directors)
      .set({
        tmdb_person_id: person.id,
        photo_url: photoUrl,
        updated_at: new Date(),
      })
      .where(sql`name = ${name}`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
