"use client";

import { useState, useTransition } from "react";
import { upsertStreaming, toggleLive, deleteStreaming } from "./actions";
import styles from "./streaming.module.css";

interface Film {
  id: number;
  title: string;
  title_zh: string | null;
}

interface StreamingRow {
  id: number;
  filmId: number;
  filmTitle: string;
  filmTitleZh: string | null;
  platform: string;
  isLive: boolean;
  availableFrom: Date | null;
  availableUntil: Date | null;
  notes: string | null;
}

interface Props {
  rows: StreamingRow[];
  films: Film[];
}

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("zh-Hant", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface FormState {
  id?: number;
  filmId: string;
  platform: string;
  isLive: boolean;
  availableFrom: string;
  availableUntil: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  filmId: "",
  platform: "",
  isLive: false,
  availableFrom: "",
  availableUntil: "",
  notes: "",
};

export function StreamingManager({ rows, films }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function openAdd() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMessage("");
  }

  function openEdit(row: StreamingRow) {
    setForm({
      id: row.id,
      filmId: String(row.filmId),
      platform: row.platform,
      isLive: row.isLive,
      availableFrom: toDateInput(row.availableFrom),
      availableUntil: toDateInput(row.availableUntil),
      notes: row.notes ?? "",
    });
    setShowForm(true);
    setMessage("");
  }

  function handleSubmit() {
    if (!form.filmId || !form.platform.trim()) {
      setMessage("請選擇影片並填入平台名稱");
      return;
    }
    startTransition(async () => {
      await upsertStreaming({
        id: form.id,
        filmId: Number(form.filmId),
        platform: form.platform,
        isCurrentlyLive: form.isLive,
        availableFrom: form.availableFrom || undefined,
        availableUntil: form.availableUntil || undefined,
        notes: form.notes || undefined,
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setMessage(form.id ? "已更新" : "已新增");
    });
  }

  function handleToggle(row: StreamingRow) {
    startTransition(async () => {
      await toggleLive(row.id, !row.isLive);
    });
  }

  function handleDelete(row: StreamingRow) {
    if (!confirm(`確定刪除《${row.filmTitle}》在 ${row.platform} 的串流記錄？`)) return;
    startTransition(async () => {
      await deleteStreaming(row.id);
    });
  }

  return (
    <div>
      {message && <div className={styles.banner}>{message}</div>}

      <div className={styles.toolbar}>
        <button className={styles.btnAdd} onClick={openAdd} type="button">
          ＋ 新增串流記錄
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{form.id ? "編輯串流記錄" : "新增串流記錄"}</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>影片</label>
              <select
                className={styles.select}
                value={form.filmId}
                onChange={(e) => setForm((f) => ({ ...f, filmId: e.target.value }))}
                disabled={!!form.id}
              >
                <option value="">— 選擇影片 —</option>
                {films.map((film) => (
                  <option key={film.id} value={film.id}>
                    {film.title}{film.title_zh ? ` (${film.title_zh})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>平台</label>
              <input
                type="text"
                className={styles.input}
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                placeholder="Netflix、MUBI、Disney+…"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>上線日期</label>
              <input
                type="date"
                className={styles.input}
                value={form.availableFrom}
                onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>下架日期</label>
              <input
                type="date"
                className={styles.input}
                value={form.availableUntil}
                onChange={(e) => setForm((f) => ({ ...f, availableUntil: e.target.value }))}
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>備註</label>
              <input
                type="text"
                className={styles.input}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="選填，例：院線同步串流"
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFull} ${styles.fieldLive}`}>
              <label className={styles.liveLabel}>
                <input
                  type="checkbox"
                  checked={form.isLive}
                  onChange={(e) => setForm((f) => ({ ...f, isLive: e.target.checked }))}
                  className={styles.checkbox}
                />
                目前上線中
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.btnCancel}
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
            >
              取消
            </button>
            <button
              className={styles.btnSave}
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "儲存中…" : "儲存"}
            </button>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>影片</th>
            <th className={styles.th}>平台</th>
            <th className={styles.th}>狀態</th>
            <th className={styles.th}>上線</th>
            <th className={styles.th}>下架</th>
            <th className={styles.th}>備註</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className={styles.emptyCell}>
                尚無串流記錄。
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id} className={styles.tr}>
              <td className={styles.td}>
                <span className={styles.filmName}>{row.filmTitle}</span>
                {row.filmTitleZh && (
                  <span className={styles.filmZh}>{row.filmTitleZh}</span>
                )}
              </td>
              <td className={styles.td}>{row.platform}</td>
              <td className={styles.td}>
                {/* Inline toggle — synchronous update per eng D9 */}
                <button
                  className={row.isLive ? styles.badgeLive : styles.badgeOffline}
                  onClick={() => handleToggle(row)}
                  disabled={isPending}
                  type="button"
                  title={row.isLive ? "點擊設為下線" : "點擊設為上線"}
                >
                  {row.isLive ? "上線中" : "未上線"}
                </button>
              </td>
              <td className={styles.td}>{formatDate(row.availableFrom)}</td>
              <td className={styles.td}>{formatDate(row.availableUntil)}</td>
              <td className={styles.td}>
                <span className={styles.notes}>{row.notes ?? "—"}</span>
              </td>
              <td className={styles.tdActions}>
                <button
                  className={styles.btnRowEdit}
                  onClick={() => openEdit(row)}
                  type="button"
                >
                  編輯
                </button>
                <button
                  className={styles.btnRowDelete}
                  onClick={() => handleDelete(row)}
                  disabled={isPending}
                  type="button"
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
