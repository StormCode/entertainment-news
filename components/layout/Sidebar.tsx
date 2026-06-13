import Link from "next/link";
import type { SidebarStreamItem, FestivalItem } from "@/lib/queries/sidebar";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  festivals: FestivalItem[];
  comingSoon: SidebarStreamItem[];
  expiringSoon: SidebarStreamItem[];
}

export function Sidebar({ festivals, comingSoon, expiringSoon }: SidebarProps) {
  return (
    <div className={styles.sidebar}>
      <SidebarPanel heading="進行中影展" items={festivals.map((f) => ({
        label: f.label,
        sub: f.entryTitle,
        href: `/entries/${f.entrySlug}`,
      }))} />

      <SidebarPanel heading="即將上線" items={comingSoon.map((s) => ({
        label: s.filmTitleZh ?? s.filmTitle,
        sub: s.platform,
        note: s.notes ?? undefined,
      }))} />

      <SidebarPanel heading="本週下架" items={expiringSoon.map((s) => ({
        label: s.filmTitleZh ?? s.filmTitle,
        sub: s.platform,
        note: s.availableUntil
          ? `至 ${s.availableUntil.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}`
          : undefined,
      }))} />
    </div>
  );
}

interface PanelItem {
  label: string;
  sub?: string;
  note?: string;
  href?: string;
}

function SidebarPanel({ heading, items }: { heading: string; items: PanelItem[] }) {
  return (
    <section className={styles.panel} aria-label={heading}>
      <h3 className={`${styles.heading} ui`}>{heading}</h3>

      {items.length === 0 ? (
        <p className={`${styles.empty} ui`}>暫無資料</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.label} className={styles.item}>
              {item.href ? (
                <Link href={item.href} className={styles.itemLink}>
                  <span className={styles.itemLabel}>{item.label}</span>
                  {item.sub && <span className={`${styles.itemSub} ui`}>{item.sub}</span>}
                </Link>
              ) : (
                <>
                  <span className={styles.itemLabel}>{item.label}</span>
                  <span className={`${styles.itemSub} ui`}>
                    {item.sub}
                    {item.note && <span className={styles.itemNote}> · {item.note}</span>}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
