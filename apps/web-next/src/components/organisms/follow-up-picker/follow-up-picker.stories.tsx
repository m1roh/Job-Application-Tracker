import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, within } from "storybook/test";
import { FollowUpPicker } from "./follow-up-picker";

const meta: Meta<typeof FollowUpPicker> = {
  title: "Organisms/FollowUpPicker",
  component: FollowUpPicker,
  args: {
    defaultValue: "2026-07-20",
    pending: false,
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FollowUpPicker>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Planifier une relance") as HTMLInputElement;

    await expect(input).toHaveValue("2026-07-20");
    await expect(canvas.getByRole("button", { name: "Planifier" })).toBeEnabled();
  },
};

export const SubmitsTheDefaultDate: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole("button", { name: "Planifier" }));

    await expect(args.onSubmit).toHaveBeenCalledWith(new Date("2026-07-20T00:00:00.000Z"));
  },
};

export const SubmitsAnEditedDate: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Planifier une relance");

    await fireEvent.change(input, { target: { value: "2026-08-05" } });
    await fireEvent.click(canvas.getByRole("button", { name: "Planifier" }));

    await expect(args.onSubmit).toHaveBeenCalledWith(new Date("2026-08-05T00:00:00.000Z"));
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Planifier" })).toBeDisabled();
  },
};

export const EmptyDate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Planifier une relance");

    await fireEvent.change(input, { target: { value: "" } });

    await expect(canvas.getByRole("button", { name: "Planifier" })).toBeDisabled();
  },
};
