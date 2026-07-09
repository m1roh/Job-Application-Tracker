"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StatusKey } from "@job-tracker/design-tokens";
import {
  ApplicationDetailTemplate,
  type ApplicationDetailTemplateProps,
} from "../../../../components/templates/application-detail/application-detail-template";
import type { NavTab } from "../../../../components/organisms/header-nav/header-nav";
import { changeApplicationStatusAction, deleteJobApplicationAction, planFollowUpAction } from "../../actions";

const NAV_ROUTES: Record<NavTab, string> = {
  dashboard: "/",
  applications: "/candidatures",
  stats: "/statistiques",
};

const FOLLOW_UP_DEFAULT_OFFSET_DAYS = 15;

function defaultFollowUpValue(): string {
  const date = new Date();
  date.setDate(date.getDate() + FOLLOW_UP_DEFAULT_OFFSET_DAYS);
  return date.toISOString().slice(0, 10);
}

export type ApplicationDetailClientProps = Omit<
  ApplicationDetailTemplateProps,
  | "activeTab"
  | "onNavigate"
  | "onCreateApplication"
  | "userInitials"
  | "pendingStatus"
  | "onStatusSelect"
  | "followUpDefaultValue"
  | "pendingFollowUp"
  | "onPlanFollowUp"
  | "pendingDelete"
  | "onDelete"
> & { id: string };

export function ApplicationDetailClient({ id, ...panelProps }: ApplicationDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<StatusKey | null>(null);
  const [isFollowUpPending, startFollowUpTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
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

  const handlePlanFollowUp = (date: Date) => {
    setErrorMessage(null);

    startFollowUpTransition(async () => {
      const result = await planFollowUpAction(id, date);

      if ("error" in result) {
        setErrorMessage(result.error);
        return;
      }

      router.refresh();
    });
  };

  const handleDelete = () => {
    setErrorMessage(null);

    startDeleteTransition(async () => {
      const result = await deleteJobApplicationAction(id);

      if ("error" in result) {
        setErrorMessage(result.error);
        return;
      }

      router.push("/");
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
        followUpDefaultValue={defaultFollowUpValue()}
        pendingFollowUp={isFollowUpPending}
        onPlanFollowUp={handlePlanFollowUp}
        pendingDelete={isDeletePending}
        onDelete={handleDelete}
      />
      {errorMessage ? <p style={{ color: "var(--color-destructive)" }}>{errorMessage}</p> : null}
    </>
  );
}
