"use client";

import { useEffect, useState } from "react";
import type { HeadingItem } from "@/lib/markdown/render";
import styles from "./TableOfContents.module.css";

const MASTHEAD_OFFSET = 80;

interface Props {
  headings: HeadingItem[];
}

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    function update() {
      let active = "";
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= MASTHEAD_OFFSET + 16) {
          active = id;
        }
      }
      setActiveId(active);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [headings]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - MASTHEAD_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    history.pushState(null, "", `#${id}`);
  }

  if (headings.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="文章目錄">
      <p className={styles.label}>目錄</p>
      <ol className={styles.list} role="list">
        {headings.map(({ id, text, depth }) => (
          <li key={id} className={depth === 3 ? styles.h3 : styles.h2}>
            <a
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
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
