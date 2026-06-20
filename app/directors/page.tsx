import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { Masthead } from "@/components/layout/Masthead";
import { getDirectorsPaged } from "@/lib/queries/directors";
import { Pagination } from "@/components/ui/Pagination";
import styles from "./page.module.css";

export const metadata = {
  title: "導演 — 散場之後",
};

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DirectorsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let directors: Awaited<ReturnType<typeof getDirectorsPaged>>["items"] = [];
  let hasNext = false;
  try {
    const result = await getDirectorsPaged(PAGE_SIZE, (currentPage - 1) * PAGE_SIZE);
    directors = result.items;
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
          <Link href="/" className={styles.backLabel}>首頁</Link>
        </div>

        {directors.length === 0 ? (
          <p className={styles.empty}>尚無導演資料。</p>
        ) : (
          <>
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
                          <User size={32} className={styles.posterIcon} />
                        </div>
                      )}
                    </div>
                    <p className={styles.name}>{d.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination currentPage={currentPage} hasNext={hasNext} basePath="/directors" />
          </>
        )}
      </main>
    </>
  );
}
