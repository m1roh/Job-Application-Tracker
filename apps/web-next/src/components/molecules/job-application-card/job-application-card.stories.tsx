import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { JobApplicationCard } from "./job-application-card";

const meta: Meta<typeof JobApplicationCard> = {
  title: "Molecules/JobApplicationCard",
  component: JobApplicationCard,
  args: {
    company: "Nova Tech",
    initials: "NT",
    position: "Dev. Full-Stack",
    status: "application_sent",
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof JobApplicationCard>;

export const WithoutDateLabel: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Nova Tech")).toBeInTheDocument();
    await expect(canvas.getByText("Dev. Full-Stack")).toBeInTheDocument();
    await expect(canvas.getByText("Candidature envoyée")).toBeInTheDocument();
    await expect(canvas.queryByText("↻")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const WithFollowUpDate: Story = {
  args: {
    status: "follow_up_sent",
    dateLabel: "Relance le 26 juin",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Relance le 26 juin")).toBeInTheDocument();
    await expect(canvas.getByText("↻")).toBeInTheDocument();
  },
};
