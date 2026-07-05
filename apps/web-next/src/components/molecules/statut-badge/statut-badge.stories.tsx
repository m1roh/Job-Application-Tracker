import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { StatutBadge } from "./statut-badge";

const meta: Meta<typeof StatutBadge> = {
  title: "Molecules/StatutBadge",
  component: StatutBadge,
};

export default meta;
type Story = StoryObj<typeof StatutBadge>;

export const ToContact: Story = {
  args: { status: "to_contact" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("À contacter")).toBeInTheDocument();
  },
};

export const HrInterview: Story = {
  args: { status: "hr_interview" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Entretien RH")).toBeInTheDocument();
  },
};

export const OfferReceived: Story = {
  args: { status: "offer_received" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Offre reçue")).toBeInTheDocument();
  },
};

export const Rejected: Story = {
  args: { status: "rejected" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Refusé")).toBeInTheDocument();
  },
};

export const OnHold: Story = {
  args: { status: "on_hold" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("En pause")).toBeInTheDocument();
  },
};

export const OfferOpen: Story = {
  args: { status: "offer_open" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Offre ouverte")).toBeInTheDocument();
  },
};

export const ApplicationSent: Story = {
  args: { status: "application_sent" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Candidature envoyée")).toBeInTheDocument();
  },
};

export const FollowUpSent: Story = {
  args: { status: "follow_up_sent" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Relance envoyée")).toBeInTheDocument();
  },
};

export const TechnicalInterview: Story = {
  args: { status: "technical_interview" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Entretien technique")).toBeInTheDocument();
  },
};

export const Withdrawn: Story = {
  args: { status: "withdrawn" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Abandonné")).toBeInTheDocument();
  },
};
