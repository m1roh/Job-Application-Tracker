import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { statusColors } from "@job-tracker/design-tokens";
import { expect, fn, userEvent, within } from "storybook/test";
import { ApplicationDetailTemplate } from "./application-detail-template";

const meta: Meta<typeof ApplicationDetailTemplate> = {
  title: "Templates/ApplicationDetail",
  component: ApplicationDetailTemplate,
  args: {
    activeTab: "applications",
    onNavigate: fn(),
    onCreateApplication: fn(),
    userInitials: "YM",

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
type Story = StoryObj<typeof ApplicationDetailTemplate>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("JobTracker")).toBeInTheDocument();
    await expect(canvas.getByText("Nova Tech")).toBeInTheDocument();
    await expect(canvas.getByText("Développeur Full-Stack")).toBeInTheDocument();
    await expect(
      canvas.getByText("Contact via une ancienne collègue (Camille). Process en 3 étapes : RH → technique → CEO."),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Candidatures" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("applications");
  },
};
