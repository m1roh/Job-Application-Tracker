import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Chip } from "./chip";

const meta: Meta<typeof Chip> = {
  title: "Atoms/Chip",
  component: Chip,
  args: {
    onRemove: fn(),
    removeLabel: "Retirer TypeScript",
    children: "TypeScript",
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("TypeScript")).toBeInTheDocument();
    const removeButton = canvas.getByRole("button", { name: "Retirer TypeScript" });
    await userEvent.click(removeButton);
    await expect(args.onRemove).toHaveBeenCalledOnce();
  },
};

export const Remote: Story = {
  args: { children: "Remote", removeLabel: "Retirer Remote" },
};
