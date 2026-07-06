import type { JobApplication } from "@job-tracker/core/domain/job-application.js";
import type { StatusKey } from "@job-tracker/design-tokens";
import type { SortOrder } from "../../components/molecules/search-and-filters/search-and-filters.js";
import { getActivityDate } from "./to-kanban-application.js";

export type DashboardFilters = {
  searchValue: string;
  statusFilter: StatusKey | "all";
  followUpOnly: boolean;
  sortOrder: SortOrder;
};

function assertNoDuplicateIds(applications: JobApplication[]): void {
  const seenIds = new Set<string>();

  for (const application of applications) {
    const id = application.id.toString();
    if (seenIds.has(id)) {
      throw new Error(`Invalid JobApplication list: duplicate id ${id}`);
    }
    seenIds.add(id);
  }
}

function matchesFilters(application: JobApplication, filters: DashboardFilters, search: string): boolean {
  if (filters.statusFilter !== "all" && application.status !== filters.statusFilter) {
    return false;
  }

  if (filters.followUpOnly && application.status !== "follow_up_sent") {
    return false;
  }

  if (search) {
    const haystack = `${application.company.toString()} ${application.position}`.toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
}

export function filterAndSortApplications(
  applications: JobApplication[],
  filters: DashboardFilters,
): JobApplication[] {
  assertNoDuplicateIds(applications);

  // Computed eagerly for every application (not lazily inside the sort comparator): Array.prototype.sort
  // isn't guaranteed to invoke the comparator for arrays of 0 or 1 elements, which would silently skip
  // this validation for those cases otherwise.
  const activityDates = new Map(applications.map((application) => [application, getActivityDate(application)]));

  const search = filters.searchValue.trim().toLowerCase();
  const filtered = applications.filter((application) => matchesFilters(application, filters, search));

  return filtered.sort((a, b) => {
    const dateA = activityDates.get(a)!;
    const dateB = activityDates.get(b)!;

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    const diff = dateA.getTime() - dateB.getTime();
    return filters.sortOrder === "recent" ? -diff : diff;
  });
}
