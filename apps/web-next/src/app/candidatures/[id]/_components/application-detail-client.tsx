"use client";

import { useRouter } from "next/navigation";
import {
  ApplicationDetailTemplate,
  type ApplicationDetailTemplateProps,
} from "../../../../components/templates/application-detail/application-detail-template";
import type { NavTab } from "../../../../components/organisms/header-nav/header-nav";

const NAV_ROUTES: Record<NavTab, string> = {
  dashboard: "/",
  applications: "/candidatures",
  stats: "/statistiques",
};

export type ApplicationDetailClientProps = Omit<
  ApplicationDetailTemplateProps,
  "activeTab" | "onNavigate" | "onCreateApplication" | "userInitials"
>;

export function ApplicationDetailClient(props: ApplicationDetailClientProps) {
  const router = useRouter();

  return (
    <ApplicationDetailTemplate
      {...props}
      activeTab="applications"
      onNavigate={(tab: NavTab) => router.push(NAV_ROUTES[tab])}
      onCreateApplication={() => router.push("/candidatures/new")}
      userInitials="RH"
    />
  );
}
