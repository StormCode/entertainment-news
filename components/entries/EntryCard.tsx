import Link from "next/link";
import Image from "next/image";
import type { EntryWithFilm } from "@/lib/queries/entries";
import styles from "./EntryCard.module.css";

interface EntryCardProps {
  entry: EntryWithFilm;
}

export function EntryCard({ entry }: EntryCardProps) {
  const posterUrl = entry.film?.posterUrl ?? null;
  const director = entry.film?.director ?? null;
  const runtime = entry.film?.runtimeMin ?? null;
  const filmTitle = entry.film?.titleZh ?? entry.film?.title ?? entry.title;

  return (
    <Link href={`/entries/${entry.slug}`} className={styles.card}>
      <div className={styles.poster}>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`《${filmTitle}》海報`}
            fill
            sizes="(max-width: 599px) 50vw, (max-width: 899px) 25vw, (max-width: 1199px) 17vw, 13vw"
            className={styles.posterImg}
          />
        ) : (
          <div className={styles.posterPlaceholder} aria-hidden="true" />
        )}

        {/* Desktop hover overlay */}
        <div className={styles.overlay} aria-hidden="true">
          <p className={styles.overlayTitle}>《{filmTitle}》</p>
          {(director || runtime) && (
            <p className={styles.overlayMeta}>
              {director ?? ""}
              {director && runtime ? " · " : ""}
              {runtime ? `${runtime}m` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Mobile caption — always visible, hidden on desktop */}
      <p className={styles.mobileCaption}>{filmTitle}</p>
    </Link>
  );
}
