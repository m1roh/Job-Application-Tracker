import type { HTMLAttributes, ReactNode } from "react";
import styles from "./badge.module.css";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  dotColor?: string;
};

export function Badge({
  children,
  textColor,
  backgroundColor,
  borderColor,
  dotColor,
  className,
  style,
  ...rest
}: BadgeProps) {
  const classes = [styles.badge, className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      style={{ color: textColor, backgroundColor, borderColor, ...style }}
      {...rest}
    >
      {dotColor ? <span className={styles.dot} style={{ backgroundColor: dotColor }} /> : null}
      {children}
    </span>
  );
}
