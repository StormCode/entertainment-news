"use client";

import { useState, useEffect } from "react";

const FONT_SIZES = [16, 18, 21] as const;
type FontSize = (typeof FONT_SIZES)[number];
const STORAGE_KEY = "article-font-size";
const DEFAULT: FontSize = 18;

function parseStoredSize(raw: string | null): FontSize {
  const n = parseInt(raw ?? "", 10);
  return (FONT_SIZES as readonly number[]).includes(n)
    ? (n as FontSize)
    : DEFAULT;
}

export function useArticlePrefs() {
  const [fontSize, setFontSizeState] = useState<FontSize>(DEFAULT);

  useEffect(() => {
    try {
      setFontSizeState(parseStoredSize(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // localStorage unavailable (private browsing) — keep default
    }
  }, []);

  function setFontSize(size: FontSize) {
    setFontSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEY, String(size));
    } catch {
      // ignore
    }
  }

  return { fontSize, setFontSize };
}
