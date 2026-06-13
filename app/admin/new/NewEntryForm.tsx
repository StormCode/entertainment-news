"use client";

import { useState, useTransition } from "react";
import { Toast } from "@/components/ui/Toast";
import { fetchFilmData, saveEntry } from "./actions";
import styles from "./page.module.css";

interface FilmPreview {
  title: string;
  director: string | null;
  runtimeMin: number | null;
  backdropPath: string | null;
  posterPath: string | null;
}

export function NewEntryForm() {
  const [tmdbUrl, setTmdbUrl] = useState("");
  const [film, setFilm] = useState<FilmPreview | null>(null);
  const [filmError, setFilmError] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleTmdbBlur() {
    if (!tmdbUrl.trim()) return;
    const result = await fetchFilmData(tmdbUrl);
    if ("error" in result) {
      setFilmError(result.error ?? "未知錯誤");
      setFilm(null);
    } else {
      setFilmError("");
      setFilm(result.film as FilmPreview);
    }
  }

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveEntry({ tmdbUrl, entryTitle, bodyMd, publish: false });
      if ("slug" in result) {
        // saved; could show brief inline confirmation
      }
    });
  }

  function handlePublish() {
    startTransition(async () => {
      // saveEntry with publish:true calls redirect() server-side
      await saveEntry({ tmdbUrl, entryTitle, bodyMd, publish: true });
    });
  }

  return (
    <div className={styles.shell}>
      {/* Left panel */}
      <aside className={styles.leftPanel} aria-label="影片資料">
        <div className={styles.panelHeading}>影片資料</div>
        <div className={styles.tmdbInput}>
          <label className={styles.label} htmlFor="tmdb-url">TMDB 網址</label>
          <input
            id="tmdb-url"
            type="url"
            value={tmdbUrl}
            onChange={(e) => setTmdbUrl(e.target.value)}
            onBlur={handleTmdbBlur}
            placeholder="https://www.themoviedb.org/movie/..."
            className={styles.input}
          />
          {filmError && <p className={styles.error}>{filmError}</p>}
          {film && (
            <div className={styles.filmPreview}>
              {film.posterPath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={film.posterPath} alt={film.title} className={styles.poster} />
              )}
              <p className={styles.filmTitle}>{film.title}</p>
              {film.director && <p className={styles.hint}>{film.director}</p>}
              {film.runtimeMin && <p className={styles.hint}>{film.runtimeMin} min</p>}
            </div>
          )}
          {!film && !filmError && <p className={styles.hint}>貼入網址後自動填入片名、導演、海報</p>}
        </div>
      </aside>

      {/* Center editor */}
      <main className={styles.editor} aria-label="文章編輯器">
        <input
          type="text"
          value={entryTitle}
          onChange={(e) => setEntryTitle(e.target.value)}
          placeholder="文章標題"
          className={styles.titleInput}
          aria-label="文章標題"
        />
        <textarea
          value={bodyMd}
          onChange={(e) => setBodyMd(e.target.value)}
          placeholder="開始寫作……"
          className={styles.bodyTextarea}
          aria-label="文章內文（Markdown）"
        />
        <div className={styles.actionBar}>
          <button
            className={styles.btnDraft}
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending || !entryTitle}
          >
            {isPending ? "儲存中…" : "儲存草稿"}
          </button>
          <button
            className={styles.btnPublish}
            type="button"
            onClick={handlePublish}
            disabled={isPending || !entryTitle || !bodyMd}
          >
            發布
          </button>
        </div>
      </main>

      {/* Right preview */}
      <aside className={styles.rightPanel} aria-label="預覽">
        <div className={styles.panelHeading}>預覽</div>
        <div className={styles.previewContent}>
          {bodyMd ? (
            <pre className={styles.previewPre}>{bodyMd}</pre>
          ) : (
            <p className={styles.previewEmpty}>開始輸入後顯示預覽</p>
          )}
        </div>
      </aside>

      {/* Publish toast — shown after redirect returns (slug set via server) */}
      {publishedSlug && (
        <Toast
          filmTitle={film?.title ?? entryTitle}
          redirectTo={`/entries/${publishedSlug}`}
        />
      )}
    </div>
  );
}
