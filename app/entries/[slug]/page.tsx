import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Masthead } from "@/components/layout/Masthead";
import { Chip } from "@/components/ui/Chip";
import { getEntryBySlug } from "@/lib/queries/entries";
import { renderMarkdown } from "@/lib/markdown/render";
import styles from "./page.module.css";

export const revalidate = 14400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEntryBySlug(slug);
  if (!result) return {};

  const filmTitle = result.film?.title_zh ?? result.film?.title ?? result.entry.title;
  return {
    title: `《${filmTitle}》`,
    description: result.entry.title,
    openGraph: {
      title: `《${filmTitle}》— 散場之後`,
      images: result.entry.backdrop_url
        ? [{ url: result.entry.backdrop_url }]
        : [],
    },
  };
}

export default async function EntryPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getEntryBySlug(slug);

  if (!result) notFound();

  const { entry, film, chips } = result;
  const filmTitle = film?.title_zh ?? film?.title ?? entry.title;
  const backdropUrl = entry.backdrop_url ?? entry.manual_backdrop_url;
  const bodyHtml = await renderMarkdown(entry.body_md);

  return (
    <>
      <Masthead />

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
          </div>
        ) : (
          <div className={styles.backdropPlaceholder} />
        )}

        {/* Film identity block */}
        <div className={styles.identity}>
          <h1 className={styles.title}>《{filmTitle}》</h1>
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
                  })}
                </time>
              </>
            )}
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

      {/* Article body — no sidebar (design D2) */}
      <article
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
        aria-label={`${filmTitle} 文章內文`}
      />
    </>
  );
}
