"use client";

import { useState } from "react";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { FormField } from "../../molecules/form-field/form-field";
import styles from "./follow-up-picker.module.css";

export type FollowUpPickerProps = {
  defaultValue: string;
  pending: boolean;
  onSubmit: (date: Date) => void;
};

export function FollowUpPicker({ defaultValue, pending, onSubmit }: FollowUpPickerProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={styles.picker}>
      <FormField id="follow-up-date" label="Planifier une relance">
        <Input type="date" value={value} onChange={(event) => setValue(event.target.value)} disabled={pending} />
      </FormField>
      <Button
        type="button"
        variant="secondary"
        size="small"
        disabled={pending || value === ""}
        onClick={() => onSubmit(new Date(`${value}T00:00:00.000Z`))}
      >
        Planifier
      </Button>
    </div>
  );
}
