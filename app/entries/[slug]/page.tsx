import { notFound } from "next/navigation";
import { Masthead } from "@/components/layout/Masthead";
import { Chip } from "@/components/ui/Chip";
import { renderMarkdown } from "@/lib/markdown/render";
import styles from "./page.module.css";

// ISR per-entry; overridden by revalidatePath on publish
export const revalidate = 14400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EntryPage({ params }: PageProps) {
  const { slug } = await params;

  // TODO: replace with real DB query once DB is wired
  // const entry = await db.query.entries.findFirst({ where: eq(entries.slug, slug) });
  const entry = null;

  if (!entry) notFound();

  // TypeScript narrowed: entry is not null below this point
  // This block will be reached once DB is wired
  return null;
}

// Placeholder for now — actual render once DB connected
export function EntryPageContent({
  title,
  director,
  runtime,
  backdropUrl,
  bodyMd,
  chips,
}: {
  title: string;
  director?: string;
  runtime?: number;
  backdropUrl?: string | null;
  bodyMd: string;
  chips: Array<{ label: string; kind: string; is_live?: string }>;
}) {
  return (
    <>
      <Masthead />

      {/* Full-bleed backdrop header */}
      <header className={styles.articleHeader}>
        {backdropUrl ? (
          <div
            className={styles.backdrop}
            style={{ backgroundImage: `url(${backdropUrl})` }}
          >
            <div className={styles.heroGradient} />
          </div>
        ) : (
          <div className={styles.backdropPlaceholder} />
        )}

        {/* Film identity block */}
        <div className={styles.identity}>
          <h1 className={styles.title}>《{title}》</h1>
          <p className={`${styles.meta} date`}>
            {director && <span>{director}</span>}
            {runtime && <span> · {runtime} min</span>}
          </p>
          {chips.length > 0 && (
            <div className={styles.chips}>
              {chips.map((c) => (
                <Chip key={c.label} label={c.label} live={c.is_live === "true"} />
              ))}
            </div>
          )}
        </div>

        <hr className={styles.rule} />
      </header>

      {/* Article body — no sidebar (design decision D2) */}
      <article
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: "" /* set via renderMarkdown */ }}
        aria-label={`${title} 文章內文`}
      />
    </>
  );
}
