import Link from "next/link";
import { Suspense } from "react";
import { Masthead } from "@/components/layout/Masthead";
import { getDirectorsPaged } from "@/lib/queries/directors";
import { DirectorGridClient } from "@/components/directors/DirectorGridClient";
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

  let initialData: Awaited<ReturnType<typeof getDirectorsPaged>> = {
    items: [],
    hasNext: false,
  };
  try {
    initialData = await getDirectorsPaged(PAGE_SIZE, (currentPage - 1) * PAGE_SIZE);
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

        {initialData.items.length === 0 ? (
          <p className={styles.empty}>尚無導演資料。</p>
        ) : (
          <Suspense fallback={<ul className={styles.grid} role="list" />}>
            <DirectorGridClient
              initialData={initialData}
              initialPage={currentPage}
            />
          </Suspense>
        )}
      </main>
    </>
  );
}
