import type { ChangeEvent } from "react";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Textarea } from "../../atoms/textarea/textarea";
import { FormField } from "../../molecules/form-field/form-field";
import { HeaderNav, type NavTab } from "../../organisms/header-nav/header-nav";
import styles from "./new-application-template.module.css";

export type NewApplicationTemplateProps = {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onCreateApplication: () => void;
  userInitials: string;

  company: string;
  onCompanyChange: (value: string) => void;
  position: string;
  onPositionChange: (value: string) => void;
  offerUrl: string;
  onOfferUrlChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;

  onCancel: () => void;
  onSubmit: () => void;
  error?: string | null;
};

export function NewApplicationTemplate({
  activeTab,
  onNavigate,
  onCreateApplication,
  userInitials,
  company,
  onCompanyChange,
  position,
  onPositionChange,
  offerUrl,
  onOfferUrlChange,
  notes,
  onNotesChange,
  onCancel,
  onSubmit,
  error,
}: NewApplicationTemplateProps) {
  return (
    <div className={styles.page}>
      <HeaderNav
        activeTab={activeTab}
        onNavigate={onNavigate}
        onCreateApplication={onCreateApplication}
        userInitials={userInitials}
      />

      <div className={styles.centered}>
        <h3 className={styles.title}>Nouvelle candidature</h3>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className={styles.row}>
            <FormField id="company" label="Entreprise">
              <Input
                required
                placeholder="ex. Solstice Labs"
                value={company}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onCompanyChange(event.target.value)}
              />
            </FormField>
            <FormField id="position" label="Poste">
              <Input
                required
                placeholder="ex. Ingénieur Backend"
                value={position}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onPositionChange(event.target.value)}
              />
            </FormField>
          </div>

          <FormField id="offer-url" label="Lien de l'offre">
            <Input
              placeholder="https://…"
              value={offerUrl}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onOfferUrlChange(event.target.value)}
            />
          </FormField>

          <FormField id="notes" label="Notes">
            <Textarea
              placeholder="Contexte, contact, process d'entretien…"
              value={notes}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onNotesChange(event.target.value)}
            />
          </FormField>

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
