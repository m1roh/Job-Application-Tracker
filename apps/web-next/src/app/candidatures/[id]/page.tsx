import { notFound } from "next/navigation";
import { getJobApplicationAction } from "../actions";
import { toApplicationDetailProps } from "../../_lib/to-application-detail-props";
import { ApplicationDetailClient } from "./_components/application-detail-client";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getJobApplicationAction(id);

  if (!application) {
    notFound();
  }

  return <ApplicationDetailClient {...toApplicationDetailProps(application)} />;
}
