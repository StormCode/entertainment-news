import Link from "next/link";
import { db } from "@/db";
import { entries, films } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import styles from "./page.module.css";

export const metadata = { title: "文章列表" };

export default async function AdminEntriesPage() {
  let rows: Array<{
    id: number;
    slug: string;
    title: string;
    is_published: boolean;
    published_at: Date | null;
    filmTitle: string | null;
  }> = [];

  try {
    rows = await db
      .select({
        id: entries.id,
        slug: entries.slug,
        title: entries.title,
        is_published: entries.is_published,
        published_at: entries.published_at,
        filmTitle: films.title,
      })
      .from(entries)
      .leftJoin(films, eq(entries.primary_film_id, films.id))
      .orderBy(desc(entries.created_at))
      .limit(100);
  } catch {
    // DB unavailable at build time
  }

  if (rows.length === 0) {
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

      <ul className={styles.entryList}>
        {rows.map((row) => (
          <li key={row.id} className={styles.entryRow}>
            <div className={styles.entryMeta}>
              <span className={row.is_published ? styles.badgePublished : styles.badgeDraft}>
                {row.is_published ? "已發布" : "草稿"}
              </span>
              {row.filmTitle && (
                <span className={styles.filmTag}>{row.filmTitle}</span>
              )}
            </div>
            <p className={styles.entryTitle}>{row.title}</p>
            {row.published_at && (
              <p className={styles.entryDate}>
                {new Date(row.published_at).toLocaleDateString("zh-Hant", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            <div className={styles.entryActions}>
              <Link href={`/admin/entries/${row.slug}/edit`} className={styles.btnEdit}>
                編輯
              </Link>
              <Link href={`/entries/${row.slug}`} className={styles.btnView} target="_blank">
                查看
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
