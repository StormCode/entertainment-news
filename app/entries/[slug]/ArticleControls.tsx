"use client";

import { useEffect } from "react";
import { useArticlePrefs } from "./useArticlePrefs";
import styles from "./ArticleControls.module.css";

const SIZES = [16, 18, 21] as const;
type Size = (typeof SIZES)[number];

export function ArticleControls() {
  const { fontSize, setFontSize } = useArticlePrefs();

  useEffect(() => {
    const article = document.getElementById("main-content");
    article?.style.setProperty("--article-font-size", `${fontSize}px`);
  }, [fontSize]);

  function smaller() {
    const idx = SIZES.indexOf(fontSize);
    if (idx > 0) setFontSize(SIZES[idx - 1] as Size);
  }

  function larger() {
    const idx = SIZES.indexOf(fontSize);
    if (idx < SIZES.length - 1) setFontSize(SIZES[idx + 1] as Size);
  }

  return (
    <div className={styles.controls} aria-label="字級控制">
      <button
        className={styles.btn}
        onClick={smaller}
        disabled={fontSize === SIZES[0]}
        aria-label="縮小字級"
        title="縮小字級"
      >
        A<sup>−</sup>
      </button>
      <button
        className={styles.btn}
        onClick={larger}
        disabled={fontSize === SIZES[SIZES.length - 1]}
        aria-label="放大字級"
        title="放大字級"
      >
        A<sup>+</sup>
      </button>
    </div>
  );
}
