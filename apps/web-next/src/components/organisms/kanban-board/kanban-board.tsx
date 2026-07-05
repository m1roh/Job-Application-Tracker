import { statusColors, type StatusKey } from "@job-tracker/design-tokens";
import { JobApplicationCard } from "../../molecules/job-application-card/job-application-card";
import { statusLabels } from "../../molecules/status-badge/status-badge";
import styles from "./kanban-board.module.css";

export type KanbanApplication = {
  id: string;
  company: string;
  initials: string;
  position: string;
  status: StatusKey;
  dateLabel?: string | null;
};

export type KanbanBoardProps = {
  applications: KanbanApplication[];
  onSelectApplication: (id: string) => void;
  onAddApplication: (status: StatusKey) => void;
};

const STATUSES = Object.keys(statusLabels) as StatusKey[];

export function KanbanBoard({ applications, onSelectApplication, onAddApplication }: KanbanBoardProps) {
  return (
    <div className={styles.board}>
      {STATUSES.map((status) => {
        const tokens = statusColors[status];
        const cards = applications.filter((application) => application.status === status);

        return (
          <div key={status} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.dot} style={{ backgroundColor: tokens.dot }} />
              <span className={styles.columnLabel} style={{ color: tokens.text }}>
                {statusLabels[status]}
              </span>
              <span className={styles.count}>{cards.length}</span>
            </div>

            {cards.map((application) => (
              <JobApplicationCard
                key={application.id}
                company={application.company}
                initials={application.initials}
                position={application.position}
                status={application.status}
                dateLabel={application.dateLabel}
                onClick={() => onSelectApplication(application.id)}
              />
            ))}

            <button type="button" className={styles.addButton} onClick={() => onAddApplication(status)}>
              + Ajouter
            </button>
          </div>
        );
      })}
    </div>
  );
}
