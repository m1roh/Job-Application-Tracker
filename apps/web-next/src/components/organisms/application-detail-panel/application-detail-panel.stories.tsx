import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { statusColors } from "@job-tracker/design-tokens";
import { expect, within } from "storybook/test";
import { ApplicationDetailPanel } from "./application-detail-panel";

const meta: Meta<typeof ApplicationDetailPanel> = {
  title: "Organisms/ApplicationDetailPanel",
  component: ApplicationDetailPanel,
  args: {
    company: "Nova Tech",
    initials: "NT",
    position: "Développeur Full-Stack",
    status: "application_sent",
    applicationDateLabel: "12 juin 2026",
    nextFollowUpLabel: "26 juin 2026",
    offerUrl: "https://example.com/offres/nova-tech",
    notes: "Contact via une ancienne collègue (Camille). Process en 3 étapes : RH → technique → CEO.",
    history: [
      { label: "Candidature envoyée", date: "12 juin 2026", dotColor: statusColors.application_sent.dot },
      { label: "Candidature créée", date: "1 juin 2026", dotColor: statusColors.to_contact.dot },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ApplicationDetailPanel>;

export const WithoutOfferLink: Story = {
  args: {
    applicationDateLabel: null,
    nextFollowUpLabel: null,
    offerUrl: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("—")).toHaveLength(3);
    await expect(canvas.queryByRole("link", { name: "Voir l'annonce ↗" })).not.toBeInTheDocument();
  },
};

export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Nova Tech")).toBeInTheDocument();
    await expect(canvas.getByText("Développeur Full-Stack")).toBeInTheDocument();
    await expect(canvas.getAllByText("Candidature envoyée")).toHaveLength(3);
    await expect(canvas.getAllByText("12 juin 2026")).toHaveLength(2);
    await expect(canvas.getByText("26 juin 2026")).toBeInTheDocument();

    const offerLink = canvas.getByRole("link", { name: "Voir l'annonce ↗" });
    await expect(offerLink).toHaveAttribute("href", "https://example.com/offres/nova-tech");
    await expect(offerLink).toHaveAttribute("target", "_blank");
    await expect(offerLink).toHaveAttribute("rel", "noopener noreferrer");

    await expect(
      canvas.getByText("Contact via une ancienne collègue (Camille). Process en 3 étapes : RH → technique → CEO."),
    ).toBeInTheDocument();

    await expect(canvas.getByText("Candidature créée")).toBeInTheDocument();
    await expect(canvas.getByText("1 juin 2026")).toBeInTheDocument();
  },
};
