import styles from "./Chip.module.css";

interface ChipProps {
  label: string;
  live?: boolean;
}

export function Chip({ label, live = false }: ChipProps) {
  return (
    <span className={`${styles.chip} ${live ? styles.live : ""} ui`}>
      {label}
    </span>
  );
}
