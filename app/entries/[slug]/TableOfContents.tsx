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

    // Query DOM directly — avoids relying on id matching between prop and DOM
    // (rehypeSanitize may add "user-content-" prefix before server restarts)
    const article = document.getElementById("main-content");
    const headingEls: HTMLElement[] = article
      ? Array.from(article.querySelectorAll("h2[id], h3[id]"))
      : [];

    function update() {
      if (headingEls.length === 0) {
        setActiveId(headings[0].id);
        return;
      }
      let activeIdx = 0;
      for (let i = 0; i < headingEls.length; i++) {
        if (headingEls[i].getBoundingClientRect().top <= MASTHEAD_OFFSET + 16) {
          activeIdx = i;
        }
      }
      setActiveId(headings[activeIdx]?.id ?? "");
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [headings]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    // Try prop id first; fall back to rehypeSanitize's clobber prefix
    const el =
      document.getElementById(id) ??
      document.getElementById(`user-content-${id}`);
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
