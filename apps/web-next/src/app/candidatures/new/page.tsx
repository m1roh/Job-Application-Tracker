"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewApplicationTemplate } from "../../../components/templates/new-application/new-application-template";
import type { NavTab } from "../../../components/organisms/header-nav/header-nav";
import { createJobApplicationAction } from "../actions";

const NAV_ROUTES: Record<NavTab, string> = {
  dashboard: "/",
  applications: "/candidatures",
  stats: "/statistiques",
};

export default function NewApplicationPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [offerUrl, setOfferUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const goToDashboard = () => router.push("/");

  const handleSubmit = async () => {
    setError(null);

    const result = await createJobApplicationAction({ company, position, offerUrl, notes });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    goToDashboard();
  };

  return (
    <NewApplicationTemplate
      activeTab="applications"
      onNavigate={(tab: NavTab) => router.push(NAV_ROUTES[tab])}
      onCreateApplication={goToDashboard}
      userInitials="RH"
      company={company}
      onCompanyChange={setCompany}
      position={position}
      onPositionChange={setPosition}
      offerUrl={offerUrl}
      onOfferUrlChange={setOfferUrl}
      notes={notes}
      onNotesChange={setNotes}
      onCancel={goToDashboard}
      onSubmit={handleSubmit}
      error={error}
    />
  );
}
