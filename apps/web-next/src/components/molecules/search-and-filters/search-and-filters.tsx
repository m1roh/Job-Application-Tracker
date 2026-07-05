import type { ChangeEvent } from "react";
import type { StatusKey } from "@job-tracker/design-tokens";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { statusLabels } from "../status-badge/status-badge";
import styles from "./search-and-filters.module.css";

export type SortOrder = "recent" | "oldest";

export type SearchAndFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusKey | "all";
  onStatusFilterChange: (value: StatusKey | "all") => void;
  followUpOnly: boolean;
  onFollowUpOnlyChange: (value: boolean) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
};

export function SearchAndFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  followUpOnly,
  onFollowUpOnlyChange,
  sortOrder,
  onSortOrderChange,
}: SearchAndFiltersProps) {
  const isStatusFilterActive = statusFilter !== "all";
  const activeStyle = { borderColor: "var(--color-accent-surface-border)", background: "var(--color-accent-surface)", color: "var(--color-accent)" };

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">
          ⌕
        </span>
        <Input
          type="search"
          aria-label="Rechercher"
          placeholder="Rechercher une entreprise, un poste…"
          value={searchValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
          style={{ paddingLeft: 32 }}
        />
      </div>

      <select
        aria-label="Filtrer par statut"
        className={styles.filterSelect}
        value={statusFilter}
        data-active={isStatusFilterActive || undefined}
        style={isStatusFilterActive ? activeStyle : undefined}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onStatusFilterChange(event.target.value as StatusKey | "all")
        }
      >
        <option value="all">Statut</option>
        {Object.entries(statusLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <Button
        type="button"
        variant="secondary"
        aria-pressed={followUpOnly}
        data-active={followUpOnly || undefined}
        style={followUpOnly ? activeStyle : undefined}
        onClick={() => onFollowUpOnlyChange(!followUpOnly)}
      >
        Relance à venir
      </Button>

      <select
        aria-label="Trier"
        className={styles.sortSelect}
        value={sortOrder}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onSortOrderChange(event.target.value as SortOrder)}
      >
        <option value="recent">Trier : plus récent</option>
        <option value="oldest">Trier : plus ancien</option>
      </select>
    </div>
  );
}
