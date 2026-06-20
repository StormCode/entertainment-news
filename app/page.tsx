export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { GenreGrid } from "@/components/genres/GenreGrid";
import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { HeroSkeleton, EntryCardSkeleton } from "@/components/skeleton";
import { getPublishedEntries, getHeroEntries } from "@/lib/queries/entries";
import { EntryGridClient } from "@/components/entries/EntryGridClient";
import { LazyReveal } from "@/components/ui/LazyReveal";
import styles from "./page.module.css";

const PAGE_SIZE = 8;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

async function Hero() {
  let heroEntries: Awaited<ReturnType<typeof getHeroEntries>> = [];
  try {
    heroEntries = await getHeroEntries();
  } catch {
    // DB unavailable — show empty carousel without crashing
  }
  return <HeroCarousel entries={heroEntries} />;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let initialData: { items: ReturnType<typeof serializeItems>; hasNext: boolean } = {
    items: [],
    hasNext: false,
  };

  try {
    const result = await getPublishedEntries(PAGE_SIZE, (currentPage - 1) * PAGE_SIZE);
    initialData = { items: serializeItems(result.items), hasNext: result.hasNext };
  } catch {
    // DB unavailable at build time or cold start
  }

  return (
    <>
      <Masthead />

      {/* Hero — full-bleed 21:9 (desktop) / 16:9 (tablet) / 4:3 (mobile) */}
      <section className={styles.heroSection} aria-label="精選文章">
        <Suspense fallback={<HeroSkeleton />}>
          <Hero />
        </Suspense>
      </section>

      {/* Poster wall — full-width, no sidebar */}
      <main id="main-content" className={styles.main} aria-label="文章牆">
        {initialData.items.length === 0 ? (
          <p className={styles.emptyState}>暫無文章。</p>
        ) : (
          <LazyReveal>
            <Suspense
              fallback={
                <div className={styles.entryGrid}>
                  {[...Array(PAGE_SIZE)].map((_, i) => (
                    <EntryCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <EntryGridClient
                initialData={initialData}
                initialPage={currentPage}
                gridClassName={styles.entryGrid}
                apiPath="/api/entries"
                basePath="/"
              />
            </Suspense>
          </LazyReveal>
        )}
      </main>

      {/* Genre discovery — bottom of page */}
      <LazyReveal>
        <GenreGrid />
      </LazyReveal>
    </>
  );
}

function serializeItems(
  items: Awaited<ReturnType<typeof getPublishedEntries>>["items"],
) {
  return items.map((item) => ({
    ...item,
    publishedAt: item.publishedAt?.toISOString() ?? null,
  }));
}
