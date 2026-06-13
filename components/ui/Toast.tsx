"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Toast.module.css";

interface ToastProps {
  filmTitle: string;
  redirectTo: string;
}

// Gold publish-success toast (design review D5)
// Auto-navigates to article page after 2s
export function Toast({ filmTitle, redirectTo }: ToastProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo);
    }, 2000);
    return () => clearTimeout(timer);
  }, [redirectTo, router]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      已發佈 ── 《{filmTitle}》{" "}
      <a href={redirectTo} className={styles.arrow}>→</a>
    </div>
  );
}
