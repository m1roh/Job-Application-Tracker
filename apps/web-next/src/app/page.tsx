import { listJobApplicationsAction } from "./candidatures/actions";
import { DashboardClient } from "./candidatures/_components/dashboard-client";
import { toKanbanApplication } from "./_lib/to-kanban-application";
import { toStatItems } from "./_lib/to-stat-items";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jobApplications = await listJobApplicationsAction();

  return (
    <DashboardClient
      applications={jobApplications.map(toKanbanApplication)}
      stats={toStatItems(jobApplications)}
      userInitials="RH"
    />
  );
}
