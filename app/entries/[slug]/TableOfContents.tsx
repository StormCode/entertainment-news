"use client";

import { useEffect, useRef, useState } from "react";
import type { HeadingItem } from "@/lib/markdown/render";
import styles from "./TableOfContents.module.css";

interface Props {
  headings: HeadingItem[];
}

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="文章目錄">
      <p className={styles.label}>目錄</p>
      <ol className={styles.list} role="list">
        {headings.map(({ id, text, depth }) => (
          <li key={id} className={depth === 3 ? styles.h3 : styles.h2}>
            <a
              href={`#${id}`}
              className={`${styles.link} ${activeId === id ? styles.active : ""}`}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
