import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SearchAndFilters } from "./search-and-filters";

const meta: Meta<typeof SearchAndFilters> = {
  title: "Molecules/SearchAndFilters",
  component: SearchAndFilters,
  args: {
    searchValue: "",
    onSearchChange: fn(),
    statusFilter: "all",
    onStatusFilterChange: fn(),
    followUpOnly: false,
    onFollowUpOnlyChange: fn(),
    sortOrder: "recent",
    onSortOrderChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SearchAndFilters>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const search = canvas.getByPlaceholderText("Rechercher une entreprise, un poste…");
    await userEvent.type(search, "A");
    await expect(args.onSearchChange).toHaveBeenCalledWith("A");

    const statusSelect = canvas.getByLabelText("Filtrer par statut");
    await expect(statusSelect).not.toHaveAttribute("data-active");
    await userEvent.selectOptions(statusSelect, "rejected");
    await expect(args.onStatusFilterChange).toHaveBeenCalledWith("rejected");

    const followUpButton = canvas.getByRole("button", { name: "Relance à venir" });
    await expect(followUpButton).toHaveAttribute("aria-pressed", "false");
    await expect(followUpButton).not.toHaveAttribute("data-active");
    await userEvent.click(followUpButton);
    await expect(args.onFollowUpOnlyChange).toHaveBeenCalledWith(true);

    const sortSelect = canvas.getByLabelText("Trier");
    await userEvent.selectOptions(sortSelect, "oldest");
    await expect(args.onSortOrderChange).toHaveBeenCalledWith("oldest");
  },
};

export const ActiveFilters: Story = {
  args: {
    statusFilter: "hr_interview",
    followUpOnly: true,
    sortOrder: "oldest",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const followUpButton = canvas.getByRole("button", { name: "Relance à venir" });
    await expect(followUpButton).toHaveAttribute("aria-pressed", "true");
    await expect(followUpButton).toHaveAttribute("data-active", "true");

    const statusSelect = canvas.getByLabelText("Filtrer par statut");
    await expect(statusSelect).toHaveValue("hr_interview");
    await expect(statusSelect).toHaveAttribute("data-active", "true");

    await expect(canvas.getByLabelText("Trier")).toHaveValue("oldest");
  },
};
