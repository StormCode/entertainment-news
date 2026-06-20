import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { FESTIVALS, FESTIVAL_SLUG_TO_LABEL } from "@/lib/constants/festivals";
import { getEntriesByChip } from "@/lib/queries/entries";
import { GenreGridClient } from "@/components/genres/GenreGridClient";
import { LazyReveal } from "@/components/ui/LazyReveal";
import styles from "./page.module.css";

const PAGE_SIZE = 8;

export function generateStaticParams() {
  return FESTIVALS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = FESTIVAL_SLUG_TO_LABEL[slug as keyof typeof FESTIVAL_SLUG_TO_LABEL];
  if (!label) return {};
  return { title: `${label} — 散場之後` };
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function FestivalPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const label = FESTIVAL_SLUG_TO_LABEL[slug as keyof typeof FESTIVAL_SLUG_TO_LABEL];
  if (!label) notFound();

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  type SerializedEntry = Omit<Awaited<ReturnType<typeof getEntriesByChip>>["items"][number], "publishedAt"> & { publishedAt: string | null };
  let initialData: { items: SerializedEntry[]; hasNext: boolean } = { items: [], hasNext: false };

  try {
    const result = await getEntriesByChip("festival", label, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE);
    initialData = {
      items: result.items.map((item) => ({
        ...item,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      })),
      hasNext: result.hasNext,
    };
  } catch {
    // DB unavailable
  }

  return (
    <>
      <Masthead />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <Link href="/festivals" className={styles.back} aria-label="返回影展列表">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className={styles.heading}>{label}</h1>
        </div>
        {initialData.items.length === 0 ? (
          <p className={styles.empty}>此影展尚無文章。</p>
        ) : (
          <LazyReveal>
            <Suspense fallback={<div className={styles.grid} />}>
              <GenreGridClient
                initialData={initialData}
                initialPage={currentPage}
                slug={slug}
                apiBase="/api/festivals"
                basePath="/festivals"
              />
            </Suspense>
          </LazyReveal>
        )}
      </main>
    </>
  );
}
