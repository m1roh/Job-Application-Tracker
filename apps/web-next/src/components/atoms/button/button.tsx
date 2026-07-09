import type { ButtonHTMLAttributes, ReactNode } from "react";
import { typeScale } from "@job-tracker/design-tokens";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export type ButtonSize = "standard" | "small" | "icon";

const BUTTON_FONT_WEIGHT = 600;

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({ variant = "primary", size = "standard", className, style, children, ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");

  return (
    <button
      className={classes}
      style={{ fontSize: typeScale.body.fontSize, fontWeight: BUTTON_FONT_WEIGHT, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
