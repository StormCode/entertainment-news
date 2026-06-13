import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { resizeHero, resizePoster } from "./resize";

function getR2Client(): S3Client {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials not configured");
  }
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const BUCKET = process.env.R2_BUCKET ?? "entertainment-news";
const PUBLIC_BASE = process.env.R2_PUBLIC_URL ?? "";

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${PUBLIC_BASE}/${key}`;
}

export type UploadResult = {
  heroUrl: string | null;
  posterUrl: string | null;
};

// Upload hero + poster for a film entry.
// Returns null URLs for any that fail — entry still saves (eng D14).
export async function uploadFilmImages(opts: {
  tmdbId: number;
  backdropTmdbPath: string | null;
  posterTmdbPath: string | null;
}): Promise<UploadResult> {
  const { tmdbId, backdropTmdbPath, posterTmdbPath } = opts;
  const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";

  const [heroUrl, posterUrl] = await Promise.all([
    backdropTmdbPath
      ? (async () => {
          try {
            const raw = await fetchImageBuffer(`${TMDB_IMAGE_BASE}${backdropTmdbPath}`);
            const webp = await resizeHero(raw);
            return await putObject(`films/${tmdbId}/hero.webp`, webp, "image/webp");
          } catch {
            return null;
          }
        })()
      : Promise.resolve(null),

    posterTmdbPath
      ? (async () => {
          try {
            const raw = await fetchImageBuffer(`${TMDB_IMAGE_BASE}${posterTmdbPath}`);
            const webp = await resizePoster(raw);
            return await putObject(`films/${tmdbId}/poster.webp`, webp, "image/webp");
          } catch {
            return null;
          }
        })()
      : Promise.resolve(null),
  ]);

  return { heroUrl, posterUrl };
}
