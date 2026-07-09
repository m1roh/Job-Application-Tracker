"use client";

import { useState } from "react";
import { Button } from "../../atoms/button/button";
import styles from "./delete-application-action.module.css";

export type DeleteApplicationActionProps = {
  pending: boolean;
  onDelete: () => void;
};

export function DeleteApplicationAction({ pending, onDelete }: DeleteApplicationActionProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className={styles.actions}>
        <span className={styles.confirmText}>Supprimer définitivement cette candidature ?</span>
        <Button
          type="button"
          variant="destructive"
          size="small"
          disabled={pending}
          onClick={() => {
            setConfirming(false);
            onDelete();
          }}
        >
          Confirmer
        </Button>
        <Button type="button" variant="tertiary" size="small" onClick={() => setConfirming(false)}>
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <Button type="button" variant="destructive" size="small" disabled={pending} onClick={() => setConfirming(true)}>
        Supprimer la candidature
      </Button>
    </div>
  );
}
