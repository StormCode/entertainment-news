import { notFound } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/layout/Masthead";
import { EntryCard } from "@/components/entries/EntryCard";
import { LazyReveal } from "@/components/ui/LazyReveal";
import { getDirectors, getEntriesByDirectorName, resolveDirectorSlug } from "@/lib/queries/directors";
import styles from "./page.module.css";

export const revalidate = 14400;

export async function generateStaticParams() {
  try {
    const directors = await getDirectors();
    return directors.map((d) => ({ slug: d.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = await resolveDirectorSlug(slug).catch(() => null);
  if (!name) return {};
  return { title: `${name} — 散場之後` };
}

export default async function DirectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let directorName: string | null = null;
  let entries: Awaited<ReturnType<typeof getEntriesByDirectorName>> = [];

  try {
    directorName = await resolveDirectorSlug(slug);
    if (!directorName) notFound();
    entries = await getEntriesByDirectorName(directorName);
  } catch {
    if (!directorName) notFound();
  }

  return (
    <>
      <Masthead />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <Link href="/directors" className={styles.back} aria-label="返回導演列表">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className={styles.heading}>{directorName}</h1>
        </div>

        {entries.length === 0 ? (
          <p className={styles.empty}>此導演尚無文章。</p>
        ) : (
          <LazyReveal>
            <div className={styles.grid}>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </LazyReveal>
        )}
      </main>
    </>
  );
}
