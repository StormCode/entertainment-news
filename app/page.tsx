import { Suspense } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { HeroSkeleton, EntryCardSkeleton, SidebarSkeleton } from "@/components/skeleton";
import styles from "./page.module.css";

// ISR: revalidate every 4 hours; on-publish revalidatePath() overrides immediately (D3)
export const revalidate = 14400;

export default function HomePage() {
  return (
    <>
      <Masthead />

      {/* Hero — full-bleed 21:9 */}
      <section className={styles.heroSection} aria-label="精選文章">
        <Suspense fallback={<HeroSkeleton />}>
          {/* HeroCarousel will be imported once DB is wired */}
          <HeroSkeleton />
        </Suspense>
      </section>

      {/* Main grid: entry wall + sidebar */}
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Entry poster wall */}
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
              <div className={styles.entryGrid}>
                {/* EntryGrid component will go here */}
                <p className={styles.emptyState}>暫無文章。</p>
              </div>
            </Suspense>
          </section>

          {/* Sidebar */}
          <aside className={styles.sidebar} aria-label="側欄資訊">
            <Suspense fallback={<SidebarSkeleton />}>
              <SidebarSkeleton />
            </Suspense>
          </aside>
        </div>
      </main>
    </>
  );
}
