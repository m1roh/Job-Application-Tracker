"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StatusKey } from "@job-tracker/design-tokens";
import { DashboardTemplate, type StatItem } from "../../../components/templates/dashboard/dashboard-template";
import type { KanbanApplication } from "../../../components/organisms/kanban-board/kanban-board";
import type { SortOrder } from "../../../components/molecules/search-and-filters/search-and-filters";
import type { NavTab } from "../../../components/organisms/header-nav/header-nav";
import { filterAndSortApplications } from "../../_lib/filter-and-sort-applications";

export type DashboardClientProps = {
  applications: KanbanApplication[];
  stats: StatItem[];
  userInitials: string;
};

const NAV_ROUTES: Record<NavTab, string> = {
  dashboard: "/",
  applications: "/candidatures",
  stats: "/statistiques",
};

export function DashboardClient({ applications, stats, userInitials }: DashboardClientProps) {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");
  const [followUpOnly, setFollowUpOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  const filteredApplications = useMemo(
    () => filterAndSortApplications(applications, { searchValue, statusFilter, followUpOnly, sortOrder }),
    [applications, searchValue, statusFilter, followUpOnly, sortOrder],
  );

  return (
    <DashboardTemplate
      activeTab="dashboard"
      onNavigate={(tab: NavTab) => router.push(NAV_ROUTES[tab])}
      onCreateApplication={() => router.push("/candidatures/new")}
      userInitials={userInitials}
      stats={stats}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      followUpOnly={followUpOnly}
      onFollowUpOnlyChange={setFollowUpOnly}
      sortOrder={sortOrder}
      onSortOrderChange={setSortOrder}
      applications={filteredApplications}
      onSelectApplication={(id: string) => router.push(`/candidatures/${id}`)}
      onAddApplication={() => router.push("/candidatures/new")}
    />
  );
}
