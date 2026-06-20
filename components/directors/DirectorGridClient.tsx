"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import type { DirectorSummary } from "@/lib/queries/directors";
import styles from "@/app/directors/page.module.css";

interface Props {
  initialData: { items: DirectorSummary[]; hasNext: boolean };
  initialPage: number;
}

export function DirectorGridClient({ initialData, initialPage }: Props) {
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const prevPage = useRef(initialPage);

  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);

  useEffect(() => {
    if (currentPage === prevPage.current) return;
    prevPage.current = currentPage;
    startTransition(async () => {
      const res = await fetch(`/api/directors?page=${currentPage}`);
      const json = await res.json();
      setData(json);
    });
  }, [currentPage]);

  if (data.items.length === 0 && !isPending) return null;

  return (
    <>
      <ul
        className={styles.grid}
        role="list"
        style={isPending ? { opacity: 0.5, pointerEvents: "none" } : undefined}
      >
        {data.items.map((d) => (
          <li key={d.slug}>
            <Link href={`/directors/${d.slug}`} className={styles.card}>
              <div className={styles.poster}>
                {d.photoUrl ? (
                  <Image
                    src={d.photoUrl}
                    alt={d.name}
                    fill
                    sizes="(max-width: 599px) 40vw, (max-width: 899px) 20vw, 14vw"
                    className={styles.posterImg}
                  />
                ) : (
                  <div className={styles.posterPlaceholder} aria-hidden="true">
                    <User size={32} className={styles.posterIcon} />
                  </div>
                )}
              </div>
              <p className={styles.name}>{d.name}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination currentPage={currentPage} hasNext={data.hasNext} basePath="/directors" />
    </>
  );
}
