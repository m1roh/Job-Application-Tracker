import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DashboardTemplate } from "./dashboard-template";

const meta: Meta<typeof DashboardTemplate> = {
  title: "Templates/Dashboard",
  component: DashboardTemplate,
  args: {
    activeTab: "dashboard",
    onNavigate: fn(),
    onCreateApplication: fn(),
    userInitials: "YM",

    stats: [
      { label: "Candidatures actives", value: 12 },
      { label: "Entretiens à venir", value: 3 },
      { label: "Taux de réponse", value: "42%" },
    ],

    searchValue: "",
    onSearchChange: fn(),
    statusFilter: "all",
    onStatusFilterChange: fn(),
    followUpOnly: false,
    onFollowUpOnlyChange: fn(),
    sortOrder: "recent",
    onSortOrderChange: fn(),

    applications: [],
    onSelectApplication: fn(),
    onAddApplication: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DashboardTemplate>;

export const Empty: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("JobTracker")).toBeInTheDocument();
    await expect(canvas.getByText("Candidatures actives")).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText("Rechercher une entreprise, un poste…")).toBeInTheDocument();

    await expect(canvas.getByText("Aucune candidature ici")).toBeInTheDocument();

    const addButtons = canvas.getAllByRole("button", { name: "+ Ajouter" });
    await expect(addButtons).toHaveLength(1);

    await userEvent.click(addButtons[0]!);
    await expect(args.onCreateApplication).toHaveBeenCalledOnce();
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
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("Aucune candidature ici")).not.toBeInTheDocument();
    await expect(canvas.getByText("Nova Tech")).toBeInTheDocument();
    await expect(canvas.getByText("Acme Corp")).toBeInTheDocument();

    await userEvent.click(canvas.getByText("Nova Tech"));
    await expect(args.onSelectApplication).toHaveBeenCalledWith("1");
  },
};
