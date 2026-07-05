import { statusColors, type StatusKey } from "@job-tracker/design-tokens";
import { CompanyAvatar } from "../../atoms/company-avatar/company-avatar";
import { StatusBadge } from "../status-badge/status-badge";
import styles from "./job-application-card.module.css";

export type JobApplicationCardProps = {
  company: string;
  initials: string;
  position: string;
  status: StatusKey;
  dateLabel?: string | null;
  onClick: () => void;
};

export function JobApplicationCard({ company, initials, position, status, dateLabel, onClick }: JobApplicationCardProps) {
  const tokens = statusColors[status];

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <CompanyAvatar initials={initials} backgroundColor={tokens.bg} textColor={tokens.text} />
        <div className={styles.titles}>
          <div className={styles.company}>{company}</div>
          <div className={styles.position}>{position}</div>
        </div>
        <StatusBadge status={status} />
      </div>
      {dateLabel ? (
        <div className={styles.dateRow}>
          <span aria-hidden="true">↻</span>
          <span>{dateLabel}</span>
        </div>
      ) : null}
    </button>
  );
}
