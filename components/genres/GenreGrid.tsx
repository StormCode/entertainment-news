import { GENRES } from "@/lib/constants/genres";
import styles from "./GenreGrid.module.css";

// Color filter per genre (applied via mix-blend-mode: color over grayscale image)
// DESIGN.md D15: genre color palette
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
    <section className={styles.section} aria-label="探索電影類型">
      <h2 className={styles.heading}>探索類型</h2>
      <div className={styles.grid}>
        {GENRES.map(({ label, slug }) => (
          // v0: genre filter pages don't exist yet; cards are non-interactive
          // Desktop: CSS tooltip on hover. Mobile: purely visual.
          // v0.1: replace <div> with <Link href={`/genres/${slug}`}> and remove disabled styles
          <div key={slug} className={styles.card} aria-label={`${label}（將於 v0.1 開放）`}>
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
            <span className={styles.cardTooltip} aria-hidden="true">將於 v0.1 開放</span>
          </div>
        ))}
      </div>
    </section>
  );
}
