import type { ApplicationStatus, JobApplication } from "@job-tracker/core/domain/job-application";

export type CandidatureHistoryEntryResponse = {
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  date: string;
};

export type CandidatureResponse = {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  applicationDate: string | null;
  nextFollowUp: string | null;
  offerUrl: string | null;
  notes: string;
  history: CandidatureHistoryEntryResponse[];
};

export function toCandidatureResponse(application: JobApplication): CandidatureResponse {
  const { position, status, offerUrl, notes, applicationDate, nextFollowUp, history } = application;

  return {
    id: application.id.toString(),
    company: application.company.toString(),
    position,
    status,
    applicationDate: applicationDate?.toISOString() ?? null,
    nextFollowUp: nextFollowUp?.toISOString() ?? null,
    offerUrl,
    notes,
    history: history.map(({ previousStatus, newStatus, date }) => ({
      previousStatus,
      newStatus,
      date: date.toISOString(),
    })),
  };
}
