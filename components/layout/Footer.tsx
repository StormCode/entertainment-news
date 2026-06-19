import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.wordmark}>散場之後</p>
      <p className={styles.copy}>2026</p>
    </footer>
  );
}
