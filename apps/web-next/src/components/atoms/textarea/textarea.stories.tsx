import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Atoms/Textarea",
  component: Textarea,
  args: {
    placeholder: "Notes sur la candidature",
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Notes sur la candidature");
    await userEvent.type(textarea, "Contact RH : Jeanne, relancer vendredi.");
    await expect(textarea).toHaveValue("Contact RH : Jeanne, relancer vendredi.");
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Contact RH : Jeanne, relancer vendredi." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Notes sur la candidature");
    await expect(textarea).toBeDisabled();
  },
};
