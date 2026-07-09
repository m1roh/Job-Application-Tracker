import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DeleteApplicationAction } from "./delete-application-action";

const meta: Meta<typeof DeleteApplicationAction> = {
  title: "Organisms/DeleteApplicationAction",
  component: DeleteApplicationAction,
  args: {
    pending: false,
    onDelete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DeleteApplicationAction>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Supprimer la candidature" })).toBeInTheDocument();
    await expect(canvas.queryByText("Supprimer définitivement cette candidature ?")).not.toBeInTheDocument();
  },
};

export const ConfirmAndCancel: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Supprimer la candidature" }));

    await expect(canvas.getByText("Supprimer définitivement cette candidature ?")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Confirmer" })).toBeInTheDocument();
    await expect(args.onDelete).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "Annuler" }));

    await expect(canvas.getByRole("button", { name: "Supprimer la candidature" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Confirmer" })).not.toBeInTheDocument();
    await expect(args.onDelete).not.toHaveBeenCalled();
  },
};

export const ConfirmDeletes: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Supprimer la candidature" }));
    await userEvent.click(canvas.getByRole("button", { name: "Confirmer" }));

    await expect(args.onDelete).toHaveBeenCalledOnce();
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Supprimer la candidature" })).toBeDisabled();
  },
};
