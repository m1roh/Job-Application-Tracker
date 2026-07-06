import {
  ApplicationDetailPanel,
  type ApplicationDetailPanelProps,
} from "../../organisms/application-detail-panel/application-detail-panel";
import { HeaderNav, type NavTab } from "../../organisms/header-nav/header-nav";
import styles from "./application-detail-template.module.css";

export type ApplicationDetailTemplateProps = ApplicationDetailPanelProps & {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onCreateApplication: () => void;
  userInitials: string;
};

export function ApplicationDetailTemplate({
  activeTab,
  onNavigate,
  onCreateApplication,
  userInitials,
  ...panelProps
}: ApplicationDetailTemplateProps) {
  return (
    <div className={styles.page}>
      <HeaderNav
        activeTab={activeTab}
        onNavigate={onNavigate}
        onCreateApplication={onCreateApplication}
        userInitials={userInitials}
      />
      <ApplicationDetailPanel {...panelProps} />
    </div>
  );
}
