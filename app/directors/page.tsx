import Link from "next/link";
import Image from "next/image";
import { Masthead } from "@/components/layout/Masthead";
import { getDirectors } from "@/lib/queries/directors";
import styles from "./page.module.css";

export const revalidate = 14400;

export const metadata = {
  title: "導演 — 散場之後",
};

export default async function DirectorsPage() {
  let directors: Awaited<ReturnType<typeof getDirectors>> = [];
  try {
    directors = await getDirectors();
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
          <h1 className={styles.heading}>導演</h1>
        </div>

        {directors.length === 0 ? (
          <p className={styles.empty}>尚無導演資料。</p>
        ) : (
          <ul className={styles.grid} role="list">
            {directors.map((d) => (
              <li key={d.slug}>
                <Link href={`/directors/${d.slug}`} className={styles.card}>
                  <div className={styles.poster}>
                    {d.photoUrl ? (
                      <Image
                        src={d.photoUrl}
                        alt={d.name}
                        fill
                        sizes="(max-width: 599px) 40vw, (max-width: 899px) 20vw, 14vw"
                        className={styles.posterImg}
                      />
                    ) : (
                      <div className={styles.posterPlaceholder} aria-hidden="true">
                        <span className={styles.posterInitials}>
                          {d.name.trim().split(/\s+/).length === 1
                            ? d.name.slice(0, 2)
                            : (d.name.trim().split(/\s+/)[0][0] + d.name.trim().split(/\s+/).slice(-1)[0][0]).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className={styles.name}>{d.name}</p>
                  <p className={styles.count}>{d.entryCount} 篇</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
