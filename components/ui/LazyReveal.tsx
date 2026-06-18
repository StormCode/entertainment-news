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

    let observer: IntersectionObserver | undefined;

    // Defer measurement by one frame so layout is stable before we check
    // whether the element is above or below the fold. Without this, headless
    // and prerender environments can return stale getBoundingClientRect values,
    // causing above-fold content to receive the `ready` (opacity:0) class.
    const rafId = requestAnimationFrame(() => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add(styles.visible);
        return;
      }

      el.classList.add(styles.ready);
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add(styles.visible);
            observer?.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
