import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { statusColors } from "@job-tracker/design-tokens";
import { expect, fn, userEvent, within } from "storybook/test";
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
    canPlanFollowUp: true,
    followUpDefaultValue: "2026-07-20",
    pendingFollowUp: false,
    onPlanFollowUp: fn(),
    pendingDelete: false,
    onDelete: fn(),
    offerUrl: "https://example.com/offres/nova-tech",
    notes: "Contact via une ancienne collègue (Camille). Process en 3 étapes : RH → technique → CEO.",
    history: [
      { label: "Candidature envoyée", date: "12 juin 2026", dotColor: statusColors.application_sent.dot },
      { label: "Candidature créée", date: "1 juin 2026", dotColor: statusColors.to_contact.dot },
    ],
    nextStatusActions: [
      { status: "hr_interview", label: "Entretien RH", requiresConfirmation: false },
      { status: "rejected", label: "Refusé", requiresConfirmation: true },
    ],
    pendingStatus: null,
    onStatusSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ApplicationDetailPanel>;

export const WithoutOfferLink: Story = {
  args: {
    applicationDateLabel: null,
    nextFollowUpLabel: null,
    canPlanFollowUp: false,
    offerUrl: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("—")).toHaveLength(3);
    await expect(canvas.queryByRole("link", { name: "Voir l'annonce ↗" })).not.toBeInTheDocument();
  },
};

export const WithoutHistory: Story = {
  args: {
    status: "to_contact",
    applicationDateLabel: null,
    nextFollowUpLabel: null,
    canPlanFollowUp: false,
    offerUrl: null,
    notes: "",
    history: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Aucun historique pour l'instant")).toBeInTheDocument();
  },
};

export const Sent: Story = {
  play: async ({ args, canvasElement }) => {
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

    await userEvent.click(canvas.getByRole("button", { name: "Entretien RH" }));
    await expect(args.onStatusSelect).toHaveBeenCalledWith("hr_interview");

    await userEvent.click(canvas.getByRole("button", { name: "Planifier" }));
    await expect(args.onPlanFollowUp).toHaveBeenCalledWith(new Date("2026-07-20T00:00:00.000Z"));

    await userEvent.click(canvas.getByRole("button", { name: "Supprimer la candidature" }));
    await userEvent.click(canvas.getByRole("button", { name: "Confirmer" }));
    await expect(args.onDelete).toHaveBeenCalledOnce();
  },
};

export const TerminalStatusHasNoStatusActions: Story = {
  args: {
    status: "rejected",
    canPlanFollowUp: false,
    nextStatusActions: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Entretien RH" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Refusé" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Supprimer la candidature" })).toBeInTheDocument();
  },
};

export const CannotPlanFollowUp: Story = {
  args: {
    status: "hr_interview",
    canPlanFollowUp: false,
    nextFollowUpLabel: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByLabelText("Planifier une relance")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Planifier" })).not.toBeInTheDocument();
  },
};
