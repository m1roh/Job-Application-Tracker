import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  args: {
    placeholder: "Nom de l'entreprise",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Nom de l'entreprise");
    await userEvent.type(input, "Acme Corp");
    await expect(input).toHaveValue("Acme Corp");
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Acme Corp" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Nom de l'entreprise");
    await expect(input).toBeDisabled();
  },
};
