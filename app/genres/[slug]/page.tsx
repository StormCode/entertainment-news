import { notFound } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/layout/Masthead";
import { EntryCard } from "@/components/entries/EntryCard";
import { GENRES, GENRE_SLUG_TO_LABEL } from "@/lib/constants/genres";
import { getEntriesByGenre } from "@/lib/queries/entries";
import styles from "./page.module.css";

export const revalidate = 14400;

export function generateStaticParams() {
  return GENRES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = GENRE_SLUG_TO_LABEL[slug as keyof typeof GENRE_SLUG_TO_LABEL];
  if (!label) return {};
  return { title: `${label} — 散場之後` };
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = GENRE_SLUG_TO_LABEL[slug as keyof typeof GENRE_SLUG_TO_LABEL];
  if (!label) notFound();

  let entries: Awaited<ReturnType<typeof getEntriesByGenre>> = [];
  try {
    entries = await getEntriesByGenre(label);
  } catch {
    // DB unavailable — show empty state
  }

  return (
    <>
      <Masthead />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <Link href="/" className={styles.back} aria-label="返回首頁">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className={styles.heading}>{label}</h1>
        </div>
        {entries.length === 0 ? (
          <p className={styles.empty}>此類型尚無文章。</p>
        ) : (
          <div className={styles.grid}>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
