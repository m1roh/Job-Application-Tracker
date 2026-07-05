import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { neutralColors, statusColors } from "@job-tracker/design-tokens";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  args: {
    textColor: neutralColors.textSecondary,
    backgroundColor: neutralColors.backgroundHover,
    borderColor: neutralColors.border,
    children: "Remote",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Remote")).toBeInTheDocument();
  },
};

export const WithDot: Story = {
  args: {
    textColor: statusColors.offer_received.text,
    backgroundColor: statusColors.offer_received.bg,
    borderColor: statusColors.offer_received.border,
    dotColor: statusColors.offer_received.dot,
    children: "Offre reçue",
  },
};

export const Rejected: Story = {
  args: {
    textColor: statusColors.rejected.text,
    backgroundColor: statusColors.rejected.bg,
    borderColor: statusColors.rejected.border,
    dotColor: statusColors.rejected.dot,
    children: "Refusé",
  },
};

export const LongLabel: Story = {
  args: {
    textColor: statusColors.technical_interview.text,
    backgroundColor: statusColors.technical_interview.bg,
    borderColor: statusColors.technical_interview.border,
    dotColor: statusColors.technical_interview.dot,
    children: "Entretien technique",
  },
};
