import { cloneElement, type ReactElement } from "react";
import styles from "./form-field.module.css";

export type FormFieldProps = {
  id: string;
  label: string;
  helpText?: string;
  error?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
};

export function FormField({ id, label, helpText, error, children }: FormFieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : helpText ? helpId : undefined;

  const field = cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  });

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {field}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : helpText ? (
        <p id={helpId} className={styles.help}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
