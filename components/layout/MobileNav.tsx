"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileNav.module.css";

const NAV_ITEMS = [
  { label: "最新", href: "/" },
  { label: "導演", href: "/directors" },
  { label: "影展", href: "/festivals" },
  { label: "串流", href: "/streaming" },
  { label: "典藏", href: "/archive" },
  { label: "RSS", href: "/rss.xml" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // ESC key + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Move focus into drawer
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      {/* Hamburger — only rendered/visible on mobile via CSS */}
      <button
        ref={hamburgerRef}
        className={styles.hamburger}
        onClick={() => setOpen(true)}
        aria-label="開啟導航選單"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        type="button"
      >
        {/* Three gold bars */}
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer — 280px, --paper-2 bg, left slide-in (design D10) */}
      <div
        id="mobile-nav-drawer"
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="導航選單"
        inert={!open}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerWordmark}>散場之後</span>
          <button
            ref={closeRef}
            className={styles.closeBtn}
            onClick={close}
            aria-label="關閉選單"
            type="button"
          >
            ✕
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label="行動導航">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.drawerLink} ${pathname === item.href ? styles.drawerLinkActive : ""}`}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <span className={styles.footerMeta}>est. 2026</span>
        </div>
      </div>
    </>
  );
}
