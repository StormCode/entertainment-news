import { db } from "@/db";
import { pipelineHealth } from "@/db/schema";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pipeline 健康狀態" };

// Known pipelines — always shown even if never run
const PIPELINES = [
  { name: "nightly-backup", label: "每日備份",   thresholdHours: 48 },
  { name: "restore-test",   label: "還原測試",   thresholdHours: 14 * 24 },
] as const;

type RowStatus = "ok" | "late" | "failed" | "never";

function computeStatus(
  row: { last_run_at: Date; status: string } | undefined,
  thresholdHours: number
): RowStatus {
  if (!row) return "never";
  if (row.status === "failure") return "failed";
  const ageHours = (Date.now() - row.last_run_at.getTime()) / 3_600_000;
  return ageHours > thresholdHours ? "late" : "ok";
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} 分鐘前`;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 24) return `${hrs} 小時前`;
  const days = Math.floor(diff / 86_400_000);
  return `${days} 天前`;
}

export default async function HealthPage() {
  const rows = await db.select().from(pipelineHealth);
  const rowMap = Object.fromEntries(rows.map((r) => [r.name, r]));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Pipeline 健康狀態</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Pipeline</th>
            <th className={styles.th}>最後執行</th>
            <th className={styles.th}>狀態</th>
            <th className={styles.th}>警告閾值</th>
          </tr>
        </thead>
        <tbody>
          {PIPELINES.map(({ name, label, thresholdHours }) => {
            const row = rowMap[name];
            const status = computeStatus(row, thresholdHours);

            return (
              <tr key={name} className={styles.tr}>
                <td className={styles.td}>
                  <span className={styles.pipelineName}>{label}</span>
                  <code className={styles.pipelineSlug}>{name}</code>
                </td>

                <td className={styles.td}>
                  {row ? (
                    <>
                      <span className={styles.relativeTime}>
                        {formatRelative(row.last_run_at)}
                      </span>
                      <span className={styles.absoluteTime}>
                        {row.last_run_at.toLocaleString("zh-TW", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  ) : (
                    <span className={styles.neverRun}>—</span>
                  )}
                </td>

                <td className={styles.td}>
                  <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
                    {status === "ok"     && "正常"}
                    {status === "late"   && "逾期"}
                    {status === "failed" && "失敗"}
                    {status === "never"  && "尚未執行"}
                  </span>
                </td>

                <td className={`${styles.td} ${styles.threshold}`}>
                  {thresholdHours < 48
                    ? `${thresholdHours}h`
                    : thresholdHours < 24 * 7
                    ? `${thresholdHours / 24} 天`
                    : `${thresholdHours / 24 / 7} 週`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
