"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EntryCard } from "@/components/entries/EntryCard";
import { Pagination } from "@/components/ui/Pagination";
import type { EntryWithFilm } from "@/lib/queries/entries";
import styles from "@/app/genres/[slug]/page.module.css";

type SerializedEntry = Omit<EntryWithFilm, "publishedAt"> & { publishedAt: string | null };

function parseEntry(e: SerializedEntry): EntryWithFilm {
  return { ...e, publishedAt: e.publishedAt ? new Date(e.publishedAt) : null };
}

interface Props {
  initialData: { items: SerializedEntry[]; hasNext: boolean };
  initialPage: number;
  slug: string;
}

export function GenreGridClient({ initialData, initialPage, slug }: Props) {
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const prevPage = useRef(initialPage);
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);

  useEffect(() => {
    if (currentPage === prevPage.current) return;
    prevPage.current = currentPage;
    shouldScrollRef.current = true;
    startTransition(async () => {
      const res = await fetch(`/api/genres/${slug}?page=${currentPage}`);
      const json = await res.json();
      setData(json);
    });
  }, [currentPage, slug]);

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data]);

  if (data.items.length === 0 && !isPending) return null;

  const items = data.items.map(parseEntry);

  return (
    <>
      <div
        ref={gridRef}
        className={styles.grid}
        style={isPending ? { opacity: 0.5, pointerEvents: "none" } : undefined}
      >
        {items.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
      <Pagination currentPage={currentPage} hasNext={data.hasNext} basePath={`/genres/${slug}`} />
    </>
  );
}
