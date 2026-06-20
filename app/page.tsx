export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { EntryCard } from "@/components/entries/EntryCard";
import { GenreGrid } from "@/components/genres/GenreGrid";
import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { HeroSkeleton, EntryCardSkeleton } from "@/components/skeleton";
import { getPublishedEntries, getHeroEntries } from "@/lib/queries/entries";
import { Pagination } from "@/components/ui/Pagination";
import { LazyReveal } from "@/components/ui/LazyReveal";
import styles from "./page.module.css";

const PAGE_SIZE = 8;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

async function EntryGrid({ page }: { page: number }) {
  let items: Awaited<ReturnType<typeof getPublishedEntries>>["items"] = [];
  let hasNext = false;
  try {
    const result = await getPublishedEntries(PAGE_SIZE, (page - 1) * PAGE_SIZE);
    items = result.items;
    hasNext = result.hasNext;
  } catch {
    // DB unavailable at build time or cold start
  }

  if (items.length === 0) {
    return (
      <div className={styles.entryGrid}>
        <p className={styles.emptyState}>暫無文章。</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.entryGrid}>
        {items.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
      <Pagination currentPage={page} hasNext={hasNext} basePath="/" />
    </>
  );
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
        <LazyReveal>
          <Suspense
            fallback={
              <div className={styles.entryGrid}>
                {[...Array(8)].map((_, i) => (
                  <EntryCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <EntryGrid page={currentPage} />
          </Suspense>
        </LazyReveal>
      </main>

      {/* Genre discovery — bottom of page */}
      <LazyReveal>
        <GenreGrid />
      </LazyReveal>
    </>
  );
}
