export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { EntryCard } from "@/components/entries/EntryCard";
import { GenreGrid } from "@/components/genres/GenreGrid";
import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { HeroSkeleton, EntryCardSkeleton } from "@/components/skeleton";
import { getPublishedEntries, getHeroEntries } from "@/lib/queries/entries";
import styles from "./page.module.css";


async function EntryGrid() {
  let entries: Awaited<ReturnType<typeof getPublishedEntries>> = [];
  try {
    entries = await getPublishedEntries(40);
  } catch {
    // DB unavailable at build time or cold start — show empty state
  }

  if (entries.length === 0) {
    return (
      <div className={styles.entryGrid}>
        <p className={styles.emptyState}>暫無文章。</p>
      </div>
    );
  }

  return (
    <div className={styles.entryGrid}>
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
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

export default function HomePage() {
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
        <Suspense
          fallback={
            <div className={styles.entryGrid}>
              {[...Array(16)].map((_, i) => (
                <EntryCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <EntryGrid />
        </Suspense>
      </main>

      {/* Genre discovery — bottom of page */}
      <GenreGrid />
    </>
  );
}
