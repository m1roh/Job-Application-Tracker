"use client";

import { useState } from "react";
import type { StatusKey } from "@job-tracker/design-tokens";
import { Button } from "../../atoms/button/button";
import styles from "./status-actions.module.css";

const DESTRUCTIVE_STATUSES: StatusKey[] = ["rejected", "withdrawn"];

export type StatusActionItem = {
  status: StatusKey;
  label: string;
  requiresConfirmation: boolean;
};

export type StatusActionsProps = {
  actions: StatusActionItem[];
  pendingStatus: StatusKey | null;
  onSelect: (status: StatusKey) => void;
};

export function StatusActions({ actions, pendingStatus, onSelect }: StatusActionsProps) {
  const [confirming, setConfirming] = useState<StatusKey | null>(null);

  if (actions.length === 0) {
    return null;
  }

  const confirmingAction = actions.find((action) => action.status === confirming) ?? null;

  if (confirmingAction) {
    const variant = DESTRUCTIVE_STATUSES.includes(confirmingAction.status) ? "destructive" : "secondary";

    return (
      <div className={styles.actions}>
        <span className={styles.confirmText}>Confirmer le passage à {confirmingAction.label} ?</span>
        <Button
          type="button"
          variant={variant}
          size="small"
          disabled={pendingStatus !== null}
          onClick={() => {
            setConfirming(null);
            onSelect(confirmingAction.status);
          }}
        >
          Confirmer
        </Button>
        <Button type="button" variant="tertiary" size="small" onClick={() => setConfirming(null)}>
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          variant={DESTRUCTIVE_STATUSES.includes(action.status) ? "destructive" : "secondary"}
          size="small"
          disabled={pendingStatus !== null}
          onClick={() => {
            if (action.requiresConfirmation) {
              setConfirming(action.status);
            } else {
              onSelect(action.status);
            }
          }}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
