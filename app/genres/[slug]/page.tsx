import { notFound } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/layout/Masthead";
import { EntryCard } from "@/components/entries/EntryCard";
import { GENRES, GENRE_SLUG_TO_LABEL } from "@/lib/constants/genres";
import { getEntriesByGenre } from "@/lib/queries/entries";
import { Pagination } from "@/components/ui/Pagination";
import { LazyReveal } from "@/components/ui/LazyReveal";
import styles from "./page.module.css";

const PAGE_SIZE = 8;

export function generateStaticParams() {
  return GENRES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = GENRE_SLUG_TO_LABEL[slug as keyof typeof GENRE_SLUG_TO_LABEL];
  if (!label) return {};
  return { title: `${label} — 散場之後` };
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const label = GENRE_SLUG_TO_LABEL[slug as keyof typeof GENRE_SLUG_TO_LABEL];
  if (!label) notFound();

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let items: Awaited<ReturnType<typeof getEntriesByGenre>>["items"] = [];
  let hasNext = false;
  try {
    const result = await getEntriesByGenre(label, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE);
    items = result.items;
    hasNext = result.hasNext;
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
        {items.length === 0 ? (
          <p className={styles.empty}>此類型尚無文章。</p>
        ) : (
          <LazyReveal>
            <div className={styles.grid}>
              {items.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
            <Pagination currentPage={currentPage} hasNext={hasNext} basePath={`/genres/${slug}`} />
          </LazyReveal>
        )}
      </main>
    </>
  );
}
