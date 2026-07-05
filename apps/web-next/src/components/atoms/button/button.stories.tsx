import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  args: {
    onClick: fn(),
    children: "Envoyer la candidature",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Envoyer la candidature" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Voir le détail" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary", children: "Ignorer" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Supprimer" },
};

export const Small: Story = {
  args: { size: "small", children: "Ajouter" },
};

export const Icon: Story = {
  args: { size: "icon", "aria-label": "Fermer", children: "×" },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Envoyer la candidature" });
    await expect(button).toBeDisabled();
  },
};
