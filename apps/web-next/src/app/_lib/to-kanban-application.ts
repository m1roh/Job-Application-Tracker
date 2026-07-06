import type { ApplicationStatus, JobApplication } from "@job-tracker/core/domain/job-application.js";
import type { StatusKey } from "@job-tracker/design-tokens";
import type { KanbanApplication } from "../../components/organisms/kanban-board/kanban-board.js";
import { formatDate } from "./format-date.js";
import { getInitials } from "./get-initials.js";

const STATUS_VERBS: Partial<Record<ApplicationStatus, string>> = {
  application_sent: "Envoyée le",
  follow_up_sent: "Relance le",
  hr_interview: "Entretien RH le",
  technical_interview: "Entretien technique le",
  offer_received: "Reçue le",
  rejected: "Refus le",
  on_hold: "En pause depuis le",
  withdrawn: "Abandonnée le",
};

function dateOfMostRecentTransitionTo(application: JobApplication, status: ApplicationStatus): Date | null {
  const matches = application.history.filter((entry) => entry.newStatus === status);
  return matches.length > 0 ? matches[matches.length - 1]!.date : null;
}

/**
 * The date that best represents an application's most recent activity, or null when
 * nothing has happened yet (to_contact/offer_open). Used both to build the Kanban card's
 * dateLabel and to sort applications by recency.
 */
export function getActivityDate(application: JobApplication): Date | null {
  const { status } = application;

  switch (status) {
    case "to_contact":
    case "offer_open":
      return null;

    case "application_sent":
      return application.applicationDate;

    case "follow_up_sent": {
      if (application.nextFollowUp) {
        return application.nextFollowUp;
      }
      const historyDate = dateOfMostRecentTransitionTo(application, status);
      if (!historyDate) {
        throw new Error(`Invalid JobApplication: no history entry for status ${status}`);
      }
      return historyDate;
    }

    case "hr_interview":
    case "technical_interview":
    case "offer_received":
    case "rejected":
    case "on_hold":
    case "withdrawn": {
      const historyDate = dateOfMostRecentTransitionTo(application, status);
      if (!historyDate) {
        throw new Error(`Invalid JobApplication: no history entry for status ${status}`);
      }
      return historyDate;
    }

    default:
      throw new Error(`Invalid JobApplication: unrecognized status ${status as string}`);
  }
}

function buildDateLabel(application: JobApplication): string | null {
  const activityDate = getActivityDate(application);
  if (!activityDate) {
    return null;
  }

  return `${STATUS_VERBS[application.status]!} ${formatDate(activityDate)}`;
}

export function toKanbanApplication(application: JobApplication): KanbanApplication {
  const company = application.company.toString();

  return {
    id: application.id.toString(),
    company,
    initials: getInitials(company),
    position: application.position,
    status: application.status as StatusKey,
    dateLabel: buildDateLabel(application),
  };
}
