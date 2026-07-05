import type { ReactNode } from "react";
import { neutralColors } from "@job-tracker/design-tokens";
import styles from "./chip.module.css";

export type ChipProps = {
  children: ReactNode;
  onRemove: () => void;
  removeLabel: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
};

export function Chip({
  children,
  onRemove,
  removeLabel,
  textColor = neutralColors.textSecondary,
  backgroundColor = neutralColors.backgroundHover,
  borderColor = neutralColors.border,
}: ChipProps) {
  return (
    <span className={styles.chip} style={{ color: textColor, backgroundColor, borderColor }}>
      {children}
      <button type="button" className={styles.remove} aria-label={removeLabel} onClick={onRemove}>
        ×
      </button>
    </span>
  );
}
