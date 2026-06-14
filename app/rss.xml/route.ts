import { db } from "@/db";
import { entries, films } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Revalidates with homepage ISR; also cleared by revalidatePath("/rss.xml") on publish
export const revalidate = 14400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://afterhours.film";
const SITE_TITLE = "散場之後";
const SITE_DESCRIPTION = "一份個人藝術電影日誌・每夜更新";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: Date): string {
  return date.toUTCString();
}

export async function GET() {
  let rows: Array<{
    slug: string;
    title: string;
    publishedAt: Date | null;
    filmTitle: string | null;
    filmTitleZh: string | null;
    filmDirector: string | null;
    filmYear: number | null;
  }> = [];

  try {
    rows = await db
      .select({
        slug: entries.slug,
        title: entries.title,
        publishedAt: entries.published_at,
        filmTitle: films.title,
        filmTitleZh: films.title_zh,
        filmDirector: films.director,
        filmYear: films.release_year,
      })
      .from(entries)
      .leftJoin(films, eq(entries.primary_film_id, films.id))
      .where(eq(entries.is_published, true))
      .orderBy(desc(entries.published_at))
      .limit(50);
  } catch {
    // Return empty feed on DB error
  }

  const items = rows
    .filter((r) => r.publishedAt)
    .map((r) => {
      const url = `${SITE_URL}/entries/${r.slug}`;
      const parts: string[] = [];
      if (r.filmTitle) parts.push(r.filmTitle);
      if (r.filmTitleZh) parts.push(r.filmTitleZh);
      if (r.filmDirector) parts.push(`導演：${r.filmDirector}`);
      if (r.filmYear) parts.push(`${r.filmYear}`);
      const desc = parts.length ? escapeXml(parts.join("・")) : "";

      return `    <item>
      <title>${escapeXml(r.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(r.publishedAt!)}</pubDate>${desc ? `\n      <description>${desc}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = rows[0]?.publishedAt ? rfc822(rows[0].publishedAt) : rfc822(new Date());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-tw</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=14400, stale-while-revalidate=86400",
    },
  });
}
