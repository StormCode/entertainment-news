import { Suspense } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { Sidebar } from "@/components/layout/Sidebar";
import { EntryCard } from "@/components/entries/EntryCard";
import { GenreGrid } from "@/components/genres/GenreGrid";
import { HeroSlide } from "@/components/hero/HeroSlide";
import { HeroSkeleton, EntryCardSkeleton, SidebarSkeleton } from "@/components/skeleton";
import { getPublishedEntries, getHeroEntry } from "@/lib/queries/entries";
import { getActiveFestivals, getComingSoonStreaming, getExpiringSoonStreaming } from "@/lib/queries/sidebar";
import styles from "./page.module.css";

// ISR: revalidate every 4 hours; on-publish revalidatePath() overrides immediately (eng D3)
export const revalidate = 14400;

async function EntryGrid() {
  let entries: Awaited<ReturnType<typeof getPublishedEntries>> = [];
  try {
    entries = await getPublishedEntries(20);
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
  let entry = null;
  try {
    entry = await getHeroEntry();
  } catch {
    // DB unavailable — show placeholder without crashing
  }
  return <HeroSlide entry={entry} />;
}

async function SidebarData() {
  try {
    const [festivals, comingSoon, expiringSoon] = await Promise.all([
      getActiveFestivals(),
      getComingSoonStreaming(),
      getExpiringSoonStreaming(),
    ]);
    return <Sidebar festivals={festivals} comingSoon={comingSoon} expiringSoon={expiringSoon} />;
  } catch {
    return <Sidebar festivals={[]} comingSoon={[]} expiringSoon={[]} />;
  }
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

      {/* Main grid: entry wall (1fr) + sidebar (280px) */}
      <main className={styles.main}>
        <div className={styles.grid}>
          <section className={styles.entries} aria-label="文章牆">
            <Suspense
              fallback={
                <div className={styles.entryGrid}>
                  {[...Array(6)].map((_, i) => (
                    <EntryCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <EntryGrid />
            </Suspense>
          </section>

          <aside className={styles.sidebar} aria-label="側欄資訊">
            <Suspense fallback={<SidebarSkeleton />}>
              <SidebarData />
            </Suspense>
          </aside>
        </div>
      </main>

      {/* Genre discovery — bottom of page so articles are primary content */}
      <GenreGrid />
    </>
  );
}
