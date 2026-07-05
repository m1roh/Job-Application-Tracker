import type { TextareaHTMLAttributes } from "react";
import styles from "./textarea.module.css";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...rest }: TextareaProps) {
  const classes = [styles.textarea, className].filter(Boolean).join(" ");
  return <textarea className={classes} {...rest} />;
}
