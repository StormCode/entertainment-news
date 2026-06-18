"use client";
import { useRef, useEffect } from "react";
import styles from "./LazyReveal.module.css";

export function LazyReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!window.IntersectionObserver) {
      el.classList.add(styles.visible);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add(styles.visible);
      return;
    }

    el.classList.add(styles.ready);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.visible);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
