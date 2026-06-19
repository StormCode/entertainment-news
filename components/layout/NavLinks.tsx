"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchToggle } from "./SearchToggle";
import styles from "./Masthead.module.css";

const NAV_ITEMS = [
  { label: "最新", href: "/" },
  { label: "導演", href: "/directors" },
  { label: "影展", href: "/festivals" },
  { label: "典藏", href: "/archive" },
  { label: "RSS", href: "/rss.xml" },
];

export function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href;
  }

  return (
    <nav className={styles.nav} aria-label="主要導航">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ui${isActive(item.href) ? ` ${styles.navLinkActive}` : ""}`}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
      <SearchToggle />
    </nav>
  );
}
