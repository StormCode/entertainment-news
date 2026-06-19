"use client";

import { useEffect, useState } from "react";
import styles from "./ReadingProgress.module.css";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const article = document.getElementById("main-content");
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrolled = vh - top;
      const pct = (scrolled / height) * 100;
      setProgress(Math.min(100, Math.max(0, pct)));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className={styles.bar}
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="閱讀進度"
    />
  );
}
