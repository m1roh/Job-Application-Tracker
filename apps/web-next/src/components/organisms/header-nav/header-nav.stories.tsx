import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HeaderNav } from "./header-nav";

const meta: Meta<typeof HeaderNav> = {
  title: "Organisms/HeaderNav",
  component: HeaderNav,
  args: {
    activeTab: "dashboard",
    onNavigate: fn(),
    onCreateApplication: fn(),
    userInitials: "YM",
  },
};

export default meta;
type Story = StoryObj<typeof HeaderNav>;

export const Dashboard: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("JobTracker")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Tableau de bord" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("button", { name: "Candidatures" })).not.toHaveAttribute("aria-current");

    await userEvent.click(canvas.getByRole("button", { name: "Candidatures" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("applications");

    await userEvent.click(canvas.getByRole("button", { name: "+ Nouvelle candidature" }));
    await expect(args.onCreateApplication).toHaveBeenCalledOnce();

    await expect(canvas.getByText("YM")).toBeInTheDocument();
  },
};

export const Applications: Story = {
  args: { activeTab: "applications" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Candidatures" })).toHaveAttribute("aria-current", "page");
  },
};

export const Stats: Story = {
  args: { activeTab: "stats" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Statistiques" })).toHaveAttribute("aria-current", "page");
  },
};
