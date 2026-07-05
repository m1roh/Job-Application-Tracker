import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EmptyState } from "./empty-state";

const meta: Meta<typeof EmptyState> = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  args: {
    title: "Aucune candidature ici",
    description: "Ajoute une offre pour commencer à suivre ton pipeline.",
    actionLabel: "+ Ajouter",
    onAction: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Aucune candidature ici")).toBeInTheDocument();
    await expect(canvas.getByText("Ajoute une offre pour commencer à suivre ton pipeline.")).toBeInTheDocument();

    const actionButton = canvas.getByRole("button", { name: "+ Ajouter" });
    await userEvent.click(actionButton);
    await expect(args.onAction).toHaveBeenCalledOnce();
  },
};
