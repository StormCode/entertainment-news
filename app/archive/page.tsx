import Link from "next/link";
import type { Metadata } from "next";
import { Masthead } from "@/components/layout/Masthead";
import { getArchiveByDecade } from "@/lib/queries/archive";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "典藏" };

export default async function ArchivePage() {
  let decades: Awaited<ReturnType<typeof getArchiveByDecade>> = [];
  try {
    decades = await getArchiveByDecade();
  } catch {
    // DB unavailable
  }

  const total = decades.reduce((n, d) => n + d.entries.length, 0);

  return (
    <>
      <Masthead />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <h1 className={styles.heading}>典藏</h1>
          <p className={styles.sub}>
            {total > 0 ? `${total} 篇 · 按電影年代索引` : "按電影年代索引"}
          </p>
        </header>

        {decades.length === 0 ? (
          <p className={styles.empty}>尚無典藏資料。</p>
        ) : (
          <div className={styles.decades}>
            {decades.map((d) => (
              <section key={d.decade} className={styles.decade}>
                <h2 className={styles.decadeLabel}>{d.label}</h2>
                <ul className={styles.entryList} role="list">
                  {d.entries.map((e) => (
                    <li key={e.slug}>
                      <Link href={`/entries/${e.slug}`} className={styles.row}>
                        <span className={styles.filmInfo}>
                          <span className={styles.filmTitle}>
                            {e.filmTitleZh
                              ? `《${e.filmTitleZh}》`
                              : e.filmTitle}
                          </span>
                          {e.director && (
                            <span className={styles.director}>{e.director}</span>
                          )}
                          <span className={styles.year}>{e.releaseYear}</span>
                        </span>
                        <span className={styles.entryTitle}>{e.entryTitle}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
