import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { StatCard } from "./stat-card";

const meta: Meta<typeof StatCard> = {
  title: "Molecules/StatCard",
  component: StatCard,
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const ActiveApplications: Story = {
  args: { label: "Candidatures actives", value: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Candidatures actives")).toBeInTheDocument();
    await expect(canvas.getByText("12")).toBeInTheDocument();
  },
};

export const UpcomingInterviews: Story = {
  args: { label: "Entretiens à venir", value: 3 },
};

export const ResponseRate: Story = {
  args: { label: "Taux de réponse", value: "42%" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("42%")).toBeInTheDocument();
  },
};
