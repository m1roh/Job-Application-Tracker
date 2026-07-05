import { neutralColors } from "@job-tracker/design-tokens";
import { Button } from "../../atoms/button/button";
import { CompanyAvatar } from "../../atoms/company-avatar/company-avatar";
import styles from "./header-nav.module.css";

export type NavTab = "dashboard" | "applications" | "stats";

const TAB_LABELS: Record<NavTab, string> = {
  dashboard: "Tableau de bord",
  applications: "Candidatures",
  stats: "Statistiques",
};

export type HeaderNavProps = {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onCreateApplication: () => void;
  userInitials: string;
};

export function HeaderNav({ activeTab, onNavigate, onCreateApplication, userInitials }: HeaderNavProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>JobTracker</div>
      <nav className={styles.nav} aria-label="Navigation principale">
        {(Object.keys(TAB_LABELS) as NavTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={tab === activeTab ? styles.tabActive : styles.tab}
            aria-current={tab === activeTab ? "page" : undefined}
            onClick={() => onNavigate(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>
      <div className={styles.actions}>
        <Button type="button" variant="primary" size="small" onClick={onCreateApplication}>
          + Nouvelle candidature
        </Button>
        <CompanyAvatar
          initials={userInitials}
          shape="circle"
          backgroundColor={neutralColors.accentSurface}
          textColor={neutralColors.accent}
        />
      </div>
    </header>
  );
}
