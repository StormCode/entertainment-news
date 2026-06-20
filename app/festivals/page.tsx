import { Masthead } from "@/components/layout/Masthead";
import { getFestivalSummaries } from "@/lib/queries/festivals";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "影展" };

export default async function FestivalsPage() {
  let festivals: Awaited<ReturnType<typeof getFestivalSummaries>> = [];
  try {
    festivals = await getFestivalSummaries();
  } catch {
    // DB unavailable
  }

  return (
    <>
      <Masthead />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <h1 className={styles.heading}>影展</h1>
          <p className={styles.sub}>按電影節選讀</p>
        </header>

        {festivals.length === 0 ? (
          <p className={styles.empty}>尚無影展資料。</p>
        ) : (
          <ul className={styles.list} role="list">
            {festivals.map((f) => (
              <li key={f.slug}>
                <Link href={`/festivals/${f.slug}`} className={styles.item}>
                  <span className={styles.label}>{f.label}</span>
                  <span className={styles.count}>{f.count} 篇</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
