import type { ApplicationStatus } from "@job-tracker/core/domain/job-application";

const STATUSES_REQUIRING_CONFIRMATION: ApplicationStatus[] = ["rejected", "withdrawn", "on_hold"];

export function requiresStatusConfirmation(status: ApplicationStatus): boolean {
  return STATUSES_REQUIRING_CONFIRMATION.includes(status);
}
