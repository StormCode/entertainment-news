import Link from "next/link";
import styles from "./Pagination.module.css";

interface Props {
  currentPage: number;
  hasNext: boolean;
  basePath: string;
}

export function Pagination({ currentPage, hasNext, basePath }: Props) {
  const hasPrev = currentPage > 1;
  const prevHref = currentPage === 2 ? basePath : `${basePath}?page=${currentPage - 1}`;
  const nextHref = `${basePath}?page=${currentPage + 1}`;

  return (
    <nav className={styles.pagination} aria-label="分頁導航">
      {hasPrev ? (
        <Link href={prevHref} className={styles.btn}>
          ← 上一頁
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`} aria-disabled="true">
          ← 上一頁
        </span>
      )}
      {hasNext ? (
        <Link href={nextHref} className={styles.btn}>
          下一頁 →
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`} aria-disabled="true">
          下一頁 →
        </span>
      )}
    </nav>
  );
}
