import type { StatusKey } from "@job-tracker/design-tokens";
import type { KanbanApplication } from "../../components/organisms/kanban-board/kanban-board";
import type { SortOrder } from "../../components/molecules/search-and-filters/search-and-filters";

export type DashboardFilters = {
  searchValue: string;
  statusFilter: StatusKey | "all";
  followUpOnly: boolean;
  sortOrder: SortOrder;
};

function assertNoDuplicateIds(applications: KanbanApplication[]): void {
  const seenIds = new Set<string>();

  for (const application of applications) {
    if (seenIds.has(application.id)) {
      throw new Error(`Invalid KanbanApplication list: duplicate id ${application.id}`);
    }
    seenIds.add(application.id);
  }
}

function matchesFilters(application: KanbanApplication, filters: DashboardFilters, search: string): boolean {
  if (filters.statusFilter !== "all" && application.status !== filters.statusFilter) {
    return false;
  }

  if (filters.followUpOnly && application.status !== "follow_up_sent") {
    return false;
  }

  if (search) {
    const haystack = `${application.company} ${application.position}`.toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
}

export function filterAndSortApplications(
  applications: KanbanApplication[],
  filters: DashboardFilters,
): KanbanApplication[] {
  assertNoDuplicateIds(applications);

  const search = filters.searchValue.trim().toLowerCase();
  const filtered = applications.filter((application) => matchesFilters(application, filters, search));

  return filtered.sort((a, b) => {
    const dateA = a.sortDate ?? null;
    const dateB = b.sortDate ?? null;

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    const diff = dateA.getTime() - dateB.getTime();
    return filters.sortOrder === "recent" ? -diff : diff;
  });
}
