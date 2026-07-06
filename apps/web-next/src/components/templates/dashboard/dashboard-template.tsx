import type { StatusKey } from "@job-tracker/design-tokens";
import { StatCard } from "../../molecules/stat-card/stat-card";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { SearchAndFilters, type SortOrder } from "../../molecules/search-and-filters/search-and-filters";
import { HeaderNav, type NavTab } from "../../organisms/header-nav/header-nav";
import { KanbanBoard, type KanbanApplication } from "../../organisms/kanban-board/kanban-board";
import styles from "./dashboard-template.module.css";

export type StatItem = {
  label: string;
  value: string | number;
};

export type DashboardTemplateProps = {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onCreateApplication: () => void;
  userInitials: string;

  stats: StatItem[];

  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusKey | "all";
  onStatusFilterChange: (value: StatusKey | "all") => void;
  followUpOnly: boolean;
  onFollowUpOnlyChange: (value: boolean) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;

  applications: KanbanApplication[];
  onSelectApplication: (id: string) => void;
  onAddApplication: (status: StatusKey) => void;
};

export function DashboardTemplate({
  activeTab,
  onNavigate,
  onCreateApplication,
  userInitials,
  stats,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  followUpOnly,
  onFollowUpOnlyChange,
  sortOrder,
  onSortOrderChange,
  applications,
  onSelectApplication,
  onAddApplication,
}: DashboardTemplateProps) {
  return (
    <div className={styles.page}>
      <HeaderNav
        activeTab={activeTab}
        onNavigate={onNavigate}
        onCreateApplication={onCreateApplication}
        userInitials={userInitials}
      />

      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        followUpOnly={followUpOnly}
        onFollowUpOnlyChange={onFollowUpOnlyChange}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
      />

      {applications.length === 0 ? (
        <EmptyState
          title="Aucune candidature ici"
          description="Ajoute une offre pour commencer à suivre ton pipeline."
          actionLabel="+ Ajouter"
          onAction={onCreateApplication}
        />
      ) : (
        <KanbanBoard
          applications={applications}
          onSelectApplication={onSelectApplication}
          onAddApplication={onAddApplication}
        />
      )}
    </div>
  );
}
