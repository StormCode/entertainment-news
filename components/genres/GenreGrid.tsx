import Link from "next/link";
import { GENRES } from "@/lib/constants/genres";
import styles from "./GenreGrid.module.css";

// Color filter per genre (applied via mix-blend-mode: color over grayscale image)
const GENRE_COLOR: Record<string, string> = {
  comedy:       "#f5c020", // 黃
  mystery:      "#7040c8", // 紫
  "sci-fi":     "#2060d8", // 藍
  romance:      "#e05080", // 粉
  documentary:  "#30a050", // 綠
  action:       "#e05a10", // 橘
};

export function GenreGrid() {
  return (
    <section className={styles.section} aria-label="電影類別">
      <div className={styles.grid}>
        {GENRES.map(({ label, slug }) => (
          <Link key={slug} href={`/genres/${slug}`} className={styles.card}>
            {/* Grayscale background image */}
            <span
              className={styles.cardBg}
              style={{ backgroundImage: `url('/images/genres/${slug}.jpg')` }}
              aria-hidden="true"
            />
            {/* Color filter: preserves luminance of photo, applies genre hue */}
            <span
              className={styles.cardColorFilter}
              style={{ backgroundColor: GENRE_COLOR[slug] }}
              aria-hidden="true"
            />
            {/* Dark gradient for text legibility */}
            <span className={styles.cardOverlay} aria-hidden="true" />
            <span className={styles.cardLabel}>{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
