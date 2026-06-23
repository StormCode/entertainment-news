import { GithubIcon } from "@/components/icons/GithubIcon";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wordmarkRow}>
        <p className={styles.wordmark}>散場之後</p>
        <a
          href="https://github.com/StormCode/entertainment-news"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
          aria-label="GitHub 原始碼"
        >
          <GithubIcon size={20} />
        </a>
      </div>
      <p className={styles.copy}>2026</p>
    </footer>
  );
}
