import { statusColors, type StatusKey } from "@job-tracker/design-tokens";
import { CompanyAvatar } from "../../atoms/company-avatar/company-avatar";
import { StatusBadge } from "../../molecules/status-badge/status-badge";
import styles from "./application-detail-panel.module.css";

export type HistoryEntry = {
  label: string;
  date: string;
  dotColor: string;
};

export type ApplicationDetailPanelProps = {
  company: string;
  initials: string;
  position: string;
  status: StatusKey;
  applicationDateLabel: string | null;
  nextFollowUpLabel: string | null;
  offerUrl: string | null;
  notes: string;
  history: HistoryEntry[];
};

export function ApplicationDetailPanel({
  company,
  initials,
  position,
  status,
  applicationDateLabel,
  nextFollowUpLabel,
  offerUrl,
  notes,
  history,
}: ApplicationDetailPanelProps) {
  const tokens = statusColors[status];

  return (
    <div className={styles.panel}>
      <div>
        <div className={styles.header}>
          <CompanyAvatar initials={initials} size="lg" backgroundColor={tokens.bg} textColor={tokens.text} />
          <div>
            <div className={styles.company}>{company}</div>
            <div className={styles.position}>{position}</div>
          </div>
          <div className={styles.badgeSlot}>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className={styles.metaGrid}>
          <div>
            <div className={styles.metaLabel}>Candidature envoyée</div>
            <div className={styles.metaValue}>{applicationDateLabel ?? "—"}</div>
          </div>
          <div>
            <div className={styles.metaLabel}>Prochaine relance</div>
            <div className={styles.metaValue}>{nextFollowUpLabel ?? "—"}</div>
          </div>
          <div>
            <div className={styles.metaLabel}>Lien de l&apos;offre</div>
            {offerUrl ? (
              <a href={offerUrl} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                Voir l&apos;annonce ↗
              </a>
            ) : (
              <div className={styles.metaValue}>—</div>
            )}
          </div>
        </div>

        <div className={styles.notesLabel}>Notes</div>
        <div className={styles.notes}>{notes}</div>
      </div>

      <div>
        <div className={styles.timelineLabel}>Historique</div>
        {history.length === 0 ? (
          <div className={styles.timelineEmpty}>Aucun historique pour l&apos;instant</div>
        ) : (
          <div>
            {history.map((entry, index) => (
              <div key={`${entry.label}-${entry.date}`} className={styles.timelineEntry}>
                <div className={styles.timelineMarker}>
                  <span className={styles.timelineDot} style={{ backgroundColor: entry.dotColor }} />
                  {index < history.length - 1 ? <span className={styles.timelineLine} /> : null}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineEntryLabel}>{entry.label}</div>
                  <div className={styles.timelineEntryDate}>{entry.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
