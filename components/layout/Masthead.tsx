import Link from "next/link";
import { MobileNav } from "./MobileNav";
import styles from "./Masthead.module.css";

const NAV_ITEMS = [
  { label: "最新", href: "/" },
  { label: "導演", href: "/directors" },
  { label: "影展", href: "/festivals" },
  { label: "串流", href: "/streaming" },
  { label: "典藏", href: "/archive" },
  { label: "RSS", href: "/rss.xml" },
];

export function Masthead() {
  const now = new Date();
  const year = now.getFullYear();
  const vol = year - 2026 + 1; // volume starts at 1 in 2026

  return (
    <header className={styles.masthead} style={{ position: "relative" }}>
      <div className={styles.inner}>
        <div className={`${styles.topBar} ui date`}>
          vol.{vol} · {now.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })} · est. 2026
        </div>

        <Link href="/" className={styles.wordmark} aria-label="散場之後 — 首頁">
          散場之後
        </Link>

        <p className={styles.kicker}>after the screening</p>
        <p className={`${styles.tag} ui`}>一份個人藝術電影日誌 · 每夜更新</p>

        <nav className={styles.nav} aria-label="主要導航">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`${styles.navLink} ui`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile-only: hamburger button + slide-in drawer (design D10) */}
      <MobileNav />
    </header>
  );
}
