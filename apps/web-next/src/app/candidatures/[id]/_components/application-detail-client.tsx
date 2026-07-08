"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StatusKey } from "@job-tracker/design-tokens";
import {
  ApplicationDetailTemplate,
  type ApplicationDetailTemplateProps,
} from "../../../../components/templates/application-detail/application-detail-template";
import type { NavTab } from "../../../../components/organisms/header-nav/header-nav";
import { changeApplicationStatusAction } from "../../actions";

const NAV_ROUTES: Record<NavTab, string> = {
  dashboard: "/",
  applications: "/candidatures",
  stats: "/statistiques",
};

export type ApplicationDetailClientProps = Omit<
  ApplicationDetailTemplateProps,
  "activeTab" | "onNavigate" | "onCreateApplication" | "userInitials" | "pendingStatus" | "onStatusSelect"
> & { id: string };

export function ApplicationDetailClient({ id, ...panelProps }: ApplicationDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<StatusKey | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStatusSelect = (status: StatusKey) => {
    setErrorMessage(null);
    setPendingStatus(status);

    startTransition(async () => {
      const result = await changeApplicationStatusAction(id, status);

      if ("error" in result) {
        setErrorMessage(result.error);
        setPendingStatus(null);
        return;
      }

      setPendingStatus(null);
      router.refresh();
    });
  };

  return (
    <>
      <ApplicationDetailTemplate
        {...panelProps}
        activeTab="applications"
        onNavigate={(tab: NavTab) => router.push(NAV_ROUTES[tab])}
        onCreateApplication={() => router.push("/candidatures/new")}
        userInitials="RH"
        pendingStatus={isPending ? pendingStatus : null}
        onStatusSelect={handleStatusSelect}
      />
      {errorMessage ? <p style={{ color: "var(--color-destructive)" }}>{errorMessage}</p> : null}
    </>
  );
}
