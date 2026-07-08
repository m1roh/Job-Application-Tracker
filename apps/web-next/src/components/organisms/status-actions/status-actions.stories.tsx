import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { StatusActions } from "./status-actions";

const meta: Meta<typeof StatusActions> = {
  title: "Organisms/StatusActions",
  component: StatusActions,
  args: {
    actions: [
      { status: "offer_open", label: "Offre ouverte", requiresConfirmation: false },
      { status: "application_sent", label: "Candidature envoyée", requiresConfirmation: false },
      { status: "withdrawn", label: "Abandonné", requiresConfirmation: true },
    ],
    pendingStatus: null,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof StatusActions>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Offre ouverte" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Candidature envoyée" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Abandonné" })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Offre ouverte" }));
    await expect(args.onSelect).toHaveBeenCalledWith("offer_open");
  },
};

export const RequiresConfirmation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Abandonné" }));

    await expect(canvas.getByText("Confirmer le passage à Abandonné ?")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Confirmer" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Annuler" })).toBeInTheDocument();
    await expect(args.onSelect).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "Annuler" }));

    await expect(canvas.getByRole("button", { name: "Abandonné" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Confirmer" })).not.toBeInTheDocument();
    await expect(args.onSelect).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "Abandonné" }));
    await userEvent.click(canvas.getByRole("button", { name: "Confirmer" }));

    await expect(args.onSelect).toHaveBeenCalledWith("withdrawn");
  },
};

export const Empty: Story = {
  args: { actions: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
  },
};

export const Pending: Story = {
  args: { pendingStatus: "offer_open" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Offre ouverte" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Candidature envoyée" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Abandonné" })).toBeDisabled();
  },
};
