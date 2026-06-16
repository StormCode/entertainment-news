import Link from "next/link";
import { GENRES } from "@/lib/constants/genres";
import styles from "./GenreGrid.module.css";

const GENRE_COLOR: Record<string, string> = {
  comedy:       "#f5c020",
  mystery:      "#7040c8",
  "sci-fi":     "#2060d8",
  romance:      "#e05080",
  documentary:  "#30a050",
  action:       "#e05a10",
};

export function GenreGrid() {
  return (
    <section className={styles.section} aria-label="探索電影類型">
      <h2 className={styles.heading}>探索類型</h2>
      <div className={styles.grid}>
        {GENRES.map(({ label, slug }) => (
          <Link key={slug} href={`/genres/${slug}`} className={styles.card}>
            <span
              className={styles.cardBg}
              style={{ backgroundImage: `url('/images/genres/${slug}.jpg')` }}
              aria-hidden="true"
            />
            <span
              className={styles.cardColorFilter}
              style={{ backgroundColor: GENRE_COLOR[slug] }}
              aria-hidden="true"
            />
            <span className={styles.cardOverlay} aria-hidden="true" />
            <span className={styles.cardLabel}>{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
