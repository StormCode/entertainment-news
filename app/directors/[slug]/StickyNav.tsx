"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./StickyNav.module.css";

export function StickyNav({ directorName }: { directorName: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <div
        className={`${styles.bar} ${isStuck ? styles.visible : ""}`}
        aria-hidden={!isStuck}
      >
        <div className={styles.barInner}>
          <Link href="/directors" className={styles.back}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M11 4L6 9L11 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            所有導演
          </Link>
          <span className={styles.divider} aria-hidden="true">/</span>
          <span className={styles.name}>{directorName}</span>
        </div>
      </div>
    </>
  );
}
