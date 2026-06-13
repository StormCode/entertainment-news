import Link from "next/link";
import styles from "./page.module.css";

export const metadata = { title: "文章列表" };

export default async function AdminEntriesPage() {
  // TODO: replace with real DB query
  const entries: unknown[] = [];

  if (entries.length === 0) {
    return (
      <main className={styles.page}>
        {/* Empty state — design review D6 */}
        <div className={styles.emptyState}>
          <h1 className={styles.emptyHeading}>還沒有文章。</h1>
          <p className={styles.emptyText}>寫下你第一篇電影日誌。</p>
          <Link href="/admin/new" className={styles.ctaButton}>
            新增文章
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>文章</h1>
        <Link href="/admin/new" className={styles.ctaButton}>新增</Link>
      </div>
      {/* Entry list will go here */}
    </main>
  );
}
