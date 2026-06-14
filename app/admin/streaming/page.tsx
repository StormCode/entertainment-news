export const dynamic = "force-dynamic";

import { db } from "@/db";
import { streamingAvailability, films } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { StreamingManager } from "./StreamingManager";
import styles from "./page.module.css";

export const metadata = { title: "串流管理" };

export default async function AdminStreamingPage() {
  const [rows, filmList] = await Promise.all([
    db
      .select({
        id: streamingAvailability.id,
        filmId: streamingAvailability.film_id,
        filmTitle: films.title,
        filmTitleZh: films.title_zh,
        platform: streamingAvailability.platform,
        isLive: streamingAvailability.is_currently_live,
        availableFrom: streamingAvailability.available_from,
        availableUntil: streamingAvailability.available_until,
        notes: streamingAvailability.notes,
      })
      .from(streamingAvailability)
      .innerJoin(films, eq(streamingAvailability.film_id, films.id))
      .orderBy(desc(streamingAvailability.updated_at)),

    db
      .select({ id: films.id, title: films.title, title_zh: films.title_zh })
      .from(films)
      .orderBy(films.title),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>串流上線管理</h1>
        <p className={styles.sub}>管理各平台的上線 / 下架日期。點擊狀態標籤即時切換。</p>
      </div>
      <StreamingManager rows={rows} films={filmList} />
    </main>
  );
}
