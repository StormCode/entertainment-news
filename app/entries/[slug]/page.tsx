import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Masthead } from "@/components/layout/Masthead";
import { Chip } from "@/components/ui/Chip";
import { getEntryBySlug, getEntriesByDirector } from "@/lib/queries/entries";
import { EntryCard } from "@/components/entries/EntryCard";
import { renderMarkdown, wordCount } from "@/lib/markdown/render";
import { LazyReveal } from "@/components/ui/LazyReveal";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents } from "./TableOfContents";
import { ArticleControls } from "./ArticleControls";
import { BackToTop } from "./BackToTop";
import styles from "./page.module.css";

export const revalidate = 14400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const result = await getEntryBySlug(decodedSlug);
  if (!result) return {};

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://afterhours.film";
  const filmTitle = result.film?.title_zh ?? result.film?.title ?? result.entry.title;
  const ogImageUrl = `${SITE_URL}/og?slug=${encodeURIComponent(decodedSlug)}`;

  return {
    title: `《${filmTitle}》`,
    description: result.entry.title,
    openGraph: {
      title: `《${filmTitle}》— 散場之後`,
      description: result.entry.title,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `《${filmTitle}》— 散場之後`,
      description: result.entry.title,
      images: [ogImageUrl],
    },
  };
}

export default async function EntryPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const result = await getEntryBySlug(decodedSlug);

  if (!result) notFound();

  const { entry, film, chips } = result;
  const filmTitle = film?.title_zh ?? film?.title ?? entry.title;
  const backdropUrl = entry.backdrop_url ?? entry.manual_backdrop_url;

  const relatedEntries = film?.director
    ? await getEntriesByDirector(film.director, entry.id)
    : [];
  const imageCredit = entry.image_credit ?? null;

  const { html: bodyHtml, headings } = await renderMarkdown(entry.body_md);
  const readingMin = wordCount(entry.body_md);

  return (
    <>
      <Masthead />
      <ReadingProgress />

      {/* Full-bleed backdrop header */}
      <header className={styles.articleHeader}>
        {backdropUrl ? (
          <div
            className={styles.backdrop}
            style={{ backgroundImage: `url(${backdropUrl})` }}
            role="img"
            aria-label={`《${filmTitle}》劇照`}
          >
            <div className={styles.heroGradient} />
            {imageCredit && (
              <p className={styles.imageCredit}>圖片來源：{imageCredit}</p>
            )}
          </div>
        ) : (
          <div className={styles.backdropPlaceholder} />
        )}

        {/* Film identity block */}
        <div className={styles.identity}>
          <h1 className={styles.title}>《{filmTitle}》</h1>
          <p className={styles.entryTitle}>{entry.title}</p>
          <p className={`${styles.meta} date`}>
            {film?.director && <span>{film.director}</span>}
            {film?.runtime_min && film.director && <span> · </span>}
            {film?.runtime_min && <span>{film.runtime_min} min</span>}
            {entry.published_at && (
              <>
                <span> · </span>
                <time dateTime={entry.published_at.toISOString()}>
                  {entry.published_at.toLocaleDateString("zh-TW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Taipei",
                  })}
                </time>
              </>
            )}
            <span> · </span>
            <span>約 {readingMin} 分鐘閱讀</span>
          </p>
          {chips.length > 0 && (
            <div className={styles.chips}>
              {chips.map((c) => (
                <Chip key={c.label} label={c.label} live={c.is_live === "true"} />
              ))}
            </div>
          )}
        </div>

        <hr className={styles.rule} />
      </header>

      <div className={styles.contentGrid}>
        <aside className={styles.tocSidebar}>
          <TableOfContents headings={headings} />
        </aside>
        {/* Article body — 800px column; grid handles centering on wide viewports */}
        <article
          id="main-content"
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
          aria-label={`${filmTitle} 文章內文`}
        />
      </div>

      {relatedEntries.length > 0 && (
        <LazyReveal>
          <section className={styles.related} aria-label="同導演其他文章">
            <h2 className={styles.relatedHeading}>
              {film?.director} 的其他文章
            </h2>
            <div className={styles.relatedGrid}>
              {relatedEntries.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          </section>
        </LazyReveal>
      )}

      <ArticleControls />
      <BackToTop />
    </>
  );
}
