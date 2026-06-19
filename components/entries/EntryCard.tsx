import Link from "next/link";
import Image from "next/image";
import type { EntryWithFilm } from "@/lib/queries/entries";
import { NewDot } from "./NewDot";
import styles from "./EntryCard.module.css";

interface EntryCardProps {
  entry: EntryWithFilm;
}

export function EntryCard({ entry }: EntryCardProps) {
  const posterUrl = entry.film?.posterUrl ?? null;
  const director = entry.film?.director ?? null;
  const releaseYear = entry.film?.releaseYear ?? null;
  const filmTitle = entry.film?.titleZh ?? entry.film?.title ?? entry.title;

  return (
    <Link href={`/entries/${entry.slug}`} className={styles.card}>
      {/* Movie poster — z-index:2, layered on top */}
      <div className={styles.poster}>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`《${filmTitle}》海報`}
            fill
            sizes="(max-width: 599px) 100vw, 250px"
            className={styles.posterImg}
          />
        ) : (
          <div className={styles.posterPlaceholder} aria-hidden="true" />
        )}
        <NewDot publishedAt={entry.publishedAt} />
      </div>

      {/* Article card — z-index:1, slightly behind poster */}
      <div className={styles.articleCard}>
        <p className={styles.filmLabel}>{filmTitle}</p>
        <h2 className={styles.reviewTitle}>{entry.title}</h2>
        {entry.snippet && <p className={styles.excerpt}>{entry.snippet}</p>}
        <div className={styles.footer}>
          {director && <span className={styles.chipDirector}>{director}</span>}
          {releaseYear && <span className={styles.chipYear}>{releaseYear}</span>}
        </div>
      </div>
    </Link>
  );
}
