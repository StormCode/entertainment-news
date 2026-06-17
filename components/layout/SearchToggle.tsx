"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./SearchToggle.module.css";

export function SearchToggle() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !closing) inputRef.current?.focus();
  }, [open, closing]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  function handleToggle() {
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={`${styles.iconBtn} ${open ? styles.iconBtnActive : ""}`}
        onClick={handleToggle}
        aria-label={open ? "關閉搜尋" : "開啟搜尋"}
        aria-expanded={open}
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <form action="/search" method="GET" className={styles.form} role="search">
          <label htmlFor="nav-search" className={styles.srOnly}>搜尋</label>
          <input
            ref={inputRef}
            id="nav-search"
            type="search"
            name="q"
            placeholder="搜尋…"
            className={`${styles.input} ${closing ? styles.inputClosing : ""}`}
            onKeyDown={handleKeyDown}
            aria-label="搜尋文章"
          />
        </form>
      )}
    </div>
  );
}
