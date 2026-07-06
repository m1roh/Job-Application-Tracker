import type { ApplicationStatus, JobApplication } from "@job-tracker/core/domain/job-application.js";
import type { StatItem } from "../../components/templates/dashboard/dashboard-template";
import { statusLabels } from "../../components/molecules/status-badge/status-badge";

const KNOWN_STATUSES = new Set(Object.keys(statusLabels));
const NOT_ACTIVE: ApplicationStatus[] = ["rejected", "withdrawn", "offer_received"];
const INTERVIEW_STATUSES: ApplicationStatus[] = ["hr_interview", "technical_interview"];
const NOT_SENT_YET: ApplicationStatus[] = ["to_contact", "offer_open"];
const PRE_RESPONSE_STATUSES: ApplicationStatus[] = [...NOT_SENT_YET, "application_sent"];

function assertValid(applications: JobApplication[]): void {
  const seenIds = new Set<string>();

  for (const application of applications) {
    if (!KNOWN_STATUSES.has(application.status)) {
      throw new Error(`Invalid JobApplication: unrecognized status ${application.status}`);
    }

    const id = application.id.toString();
    if (seenIds.has(id)) {
      throw new Error(`Invalid JobApplication list: duplicate id ${id}`);
    }
    seenIds.add(id);
  }
}

export function toStatItems(applications: JobApplication[]): StatItem[] {
  assertValid(applications);

  const activeCount = applications.filter((application) => !NOT_ACTIVE.includes(application.status)).length;
  const upcomingInterviews = applications.filter((application) =>
    INTERVIEW_STATUSES.includes(application.status),
  ).length;

  const sentCount = applications.filter((application) => !NOT_SENT_YET.includes(application.status)).length;
  const respondedCount = applications.filter(
    (application) => !PRE_RESPONSE_STATUSES.includes(application.status),
  ).length;
  const responseRate = sentCount === 0 ? "—" : `${Math.round((respondedCount / sentCount) * 100)}%`;

  return [
    { label: "Candidatures actives", value: activeCount },
    { label: "Entretiens à venir", value: upcomingInterviews },
    { label: "Taux de réponse", value: responseRate },
  ];
}
