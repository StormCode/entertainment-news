import Link from "next/link";
import Image from "next/image";
import type { EntryWithFilm } from "@/lib/queries/entries";
import { Chip } from "@/components/ui/Chip";
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
      {/* Poster 2:3 */}
      <div className={styles.poster}>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`《${filmTitle}》海報`}
            fill
            sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 25vw"
            className={styles.posterImg}
          />
        ) : (
          <div className={styles.posterPlaceholder} aria-hidden="true" />
        )}
      </div>

      {/* Text */}
      <div className={styles.info}>
        <h2 className={styles.title}>《{filmTitle}》</h2>

        <p className={`${styles.meta} date`}>
          {director && <span>{director}</span>}
          {runtime && director && <span> · </span>}
          {runtime && <span>{runtime} min</span>}
          {entry.publishedAt && (
            <time
              dateTime={entry.publishedAt.toISOString()}
              className={styles.date}
            >
              {" "}
              · {entry.publishedAt.toLocaleDateString("zh-TW", {
                month: "numeric",
                day: "numeric",
              })}
            </time>
          )}
        </p>

        {entry.chips.length > 0 && (
          <div className={styles.chips}>
            {entry.chips.slice(0, 3).map((c) => (
              <Chip key={c.label} label={c.label} live={c.isLive === "true"} />
            ))}
          </div>
        )}

        <p className={styles.caption}>{entry.title}</p>
      </div>
    </Link>
  );
}
