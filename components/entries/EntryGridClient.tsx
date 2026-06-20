"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EntryCard } from "./EntryCard";
import { Pagination } from "@/components/ui/Pagination";
import type { EntryWithFilm } from "@/lib/queries/entries";

type SerializedEntry = Omit<EntryWithFilm, "publishedAt"> & { publishedAt: string | null };

function parseEntry(e: SerializedEntry): EntryWithFilm {
  return { ...e, publishedAt: e.publishedAt ? new Date(e.publishedAt) : null };
}

interface Props {
  initialData: { items: SerializedEntry[]; hasNext: boolean };
  initialPage: number;
  gridClassName: string;
  apiPath: string;
  basePath: string;
}

export function EntryGridClient({
  initialData,
  initialPage,
  gridClassName,
  apiPath,
  basePath,
}: Props) {
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
      const res = await fetch(`${apiPath}?page=${currentPage}`);
      const json = await res.json();
      setData(json);
    });
  }, [currentPage, apiPath]);

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data]);

  const items = data.items.map(parseEntry);

  if (items.length === 0 && !isPending) return null;

  return (
    <>
      <div ref={gridRef} className={gridClassName} style={isPending ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
        {items.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
      <Pagination currentPage={currentPage} hasNext={data.hasNext} basePath={basePath} />
    </>
  );
}
