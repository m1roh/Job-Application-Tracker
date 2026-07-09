import { statusColors, type StatusKey } from "@job-tracker/design-tokens";
import type { JobApplication } from "@job-tracker/core/domain/job-application";
import type {
  ApplicationDetailPanelProps,
  HistoryEntry,
} from "../../components/organisms/application-detail-panel/application-detail-panel";
import { statusLabels } from "../../components/molecules/status-badge/status-badge";
import { formatDate } from "./format-date";
import { getInitials } from "./get-initials";
import { requiresStatusConfirmation } from "./requires-status-confirmation";

function assertKnownStatus(status: string): asserts status is StatusKey {
  if (!(status in statusLabels)) {
    throw new Error(`Invalid JobApplication: unrecognized status ${status}`);
  }
}

export type ApplicationDetailProps = Omit<
  ApplicationDetailPanelProps,
  "pendingStatus" | "onStatusSelect" | "followUpDefaultValue" | "pendingFollowUp" | "onPlanFollowUp"
> & {
  id: string;
};

export function toApplicationDetailProps(application: JobApplication): ApplicationDetailProps {
  assertKnownStatus(application.status);

  const company = application.company.toString();

  const history: HistoryEntry[] = [...application.history].reverse().map((entry) => {
    assertKnownStatus(entry.newStatus);

    return {
      label: statusLabels[entry.newStatus],
      date: formatDate(entry.date),
      dotColor: statusColors[entry.newStatus].dot,
    };
  });

  const nextStatusActions = application.allowedNextStatuses().map((status) => {
    assertKnownStatus(status);

    return { status, label: statusLabels[status], requiresConfirmation: requiresStatusConfirmation(status) };
  });

  return {
    id: application.id.toString(),
    company,
    initials: getInitials(company),
    position: application.position,
    status: application.status,
    applicationDateLabel: application.applicationDate ? formatDate(application.applicationDate) : null,
    nextFollowUpLabel: application.nextFollowUp ? formatDate(application.nextFollowUp) : null,
    canPlanFollowUp: application.canPlanFollowUp,
    offerUrl: application.offerUrl,
    notes: application.notes,
    history,
    nextStatusActions,
  };
}
