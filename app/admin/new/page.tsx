import styles from "./page.module.css";

export const metadata = { title: "新增文章" };

export default function AdminNewPage() {
  return (
    <div className={styles.shell}>
      {/* Ghost/Notion style: left context | center editor | right preview (design D3) */}

      {/* Left panel: film context */}
      <aside className={styles.leftPanel} aria-label="影片資料">
        <div className={styles.panelHeading}>影片資料</div>
        <div className={styles.tmdbInput}>
          <label className={styles.label} htmlFor="tmdb-url">TMDB 網址</label>
          <input
            id="tmdb-url"
            type="url"
            placeholder="https://www.themoviedb.org/movie/..."
            className={styles.input}
          />
          {/* Film data preview will render here after TMDB fetch */}
          <p className={styles.hint}>貼入網址後自動填入片名、導演、海報</p>
        </div>
      </aside>

      {/* Center: Markdown editor on light background */}
      <main className={styles.editor} aria-label="文章編輯器">
        <input
          type="text"
          placeholder="文章標題"
          className={styles.titleInput}
          aria-label="文章標題"
        />
        <textarea
          placeholder="開始寫作……"
          className={styles.bodyTextarea}
          aria-label="文章內文（Markdown）"
        />
        {/* Action bar */}
        <div className={styles.actionBar}>
          <button className={styles.btnDraft} type="button">儲存草稿</button>
          <button className={styles.btnPublish} type="button">發布</button>
        </div>
      </main>

      {/* Right panel: live preview */}
      <aside className={styles.rightPanel} aria-label="預覽">
        <div className={styles.panelHeading}>預覽</div>
        <div className={styles.previewContent}>
          <p className={styles.previewEmpty}>開始輸入後顯示預覽</p>
        </div>
      </aside>
    </div>
  );
}
