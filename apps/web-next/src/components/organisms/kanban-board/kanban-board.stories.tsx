import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { KanbanBoard } from "./kanban-board";

const meta: Meta<typeof KanbanBoard> = {
  title: "Organisms/KanbanBoard",
  component: KanbanBoard,
  args: {
    applications: [],
    onSelectApplication: fn(),
    onAddApplication: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Empty: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("À contacter")).toBeInTheDocument();
    await expect(canvas.getByText("Abandonné")).toBeInTheDocument();
    await expect(canvas.getAllByText("0")).toHaveLength(10);

    const addButtons = canvas.getAllByRole("button", { name: "+ Ajouter" });
    await expect(addButtons).toHaveLength(10);

    await userEvent.click(addButtons[0]!);
    await expect(args.onAddApplication).toHaveBeenCalledWith("to_contact");
  },
};

export const WithApplications: Story = {
  args: {
    applications: [
      { id: "1", company: "Nova Tech", initials: "NT", position: "Dev. Full-Stack", status: "to_contact" },
      {
        id: "2",
        company: "Acme Corp",
        initials: "AC",
        position: "Dev. Backend",
        status: "application_sent",
        dateLabel: "Envoyée le 12 juin",
      },
      { id: "3", company: "Lambda Data", initials: "LD", position: "Data Engineer", status: "rejected" },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Nova Tech")).toBeInTheDocument();
    await expect(canvas.getByText("Acme Corp")).toBeInTheDocument();
    await expect(canvas.getByText("Envoyée le 12 juin")).toBeInTheDocument();
    await expect(canvas.getByText("Lambda Data")).toBeInTheDocument();

    await userEvent.click(canvas.getByText("Nova Tech"));
    await expect(args.onSelectApplication).toHaveBeenCalledWith("1");
  },
};
