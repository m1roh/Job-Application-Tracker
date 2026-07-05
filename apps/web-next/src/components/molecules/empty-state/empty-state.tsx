import { Button } from "../../atoms/button/button";
import styles from "./empty-state.module.css";

export type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
      <Button type="button" variant="primary" size="small" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
