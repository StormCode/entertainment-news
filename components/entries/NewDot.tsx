"use client";

import { useEffect, useState } from "react";
import styles from "./EntryCard.module.css";

const SESSION_KEY = "prevVisit";
const STORAGE_KEY = "lastVisit";

export function NewDot({ publishedAt }: { publishedAt: Date | null }) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (!publishedAt) return;

    let prevVisit = 0;
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached !== null) {
      prevVisit = parseInt(cached, 10);
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      prevVisit = stored ? parseInt(stored, 10) : 0;
      sessionStorage.setItem(SESSION_KEY, prevVisit.toString());
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    setIsNew(publishedAt.getTime() > prevVisit);
  }, [publishedAt]);

  if (!isNew) return null;
  return <span className={styles.newBadge} aria-label="新文章">新</span>;
}
