import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import type { EntryWithFilm } from "@/lib/queries/entries";
import styles from "./HeroSlide.module.css";

interface Props {
  entry: EntryWithFilm | null;
}

export function HeroSlide({ entry }: Props) {
  const backdrop = entry?.backdropUrl ?? "/images/hero-placeholder.jpg";
  const genreChips = entry?.chips.filter((c) => c.kind === "genre") ?? [];
  const filmLabel = entry?.film?.titleZh ?? entry?.film?.title ?? null;

  if (!entry) {
    return (
      <div className={styles.hero} aria-label="精選文章">
        <div className={styles.bg} style={{ backgroundImage: `url('${backdrop}')` }} />
        <div className={styles.overlay} />
      </div>
    );
  }

  return (
    <Link href={`/entries/${entry.slug}`} className={styles.hero} aria-label={`閱讀：${entry.title}`}>
      <div className={styles.bg} style={{ backgroundImage: `url('${backdrop}')` }} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        {genreChips.length > 0 && (
          <div className={styles.chips}>
            {genreChips.map((c) => (
              <Chip key={c.label} label={c.label} />
            ))}
          </div>
        )}

        {filmLabel && (
          <p className={`${styles.filmTitle} ui`}>《{filmLabel}》</p>
        )}

        <h2 className={styles.title}>{entry.title}</h2>

        <span className={`${styles.cta} ui`}>閱讀全文 →</span>
      </div>
    </Link>
  );
}
