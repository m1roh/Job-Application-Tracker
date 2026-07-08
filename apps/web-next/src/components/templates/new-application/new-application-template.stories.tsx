import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NewApplicationTemplate } from "./new-application-template";

const meta: Meta<typeof NewApplicationTemplate> = {
  title: "Templates/NewApplication",
  component: NewApplicationTemplate,
  args: {
    activeTab: "applications",
    onNavigate: fn(),
    onCreateApplication: fn(),
    userInitials: "YM",

    company: "Nova Tech",
    onCompanyChange: fn(),
    position: "Dev. Full-Stack",
    onPositionChange: fn(),
    offerUrl: "",
    onOfferUrlChange: fn(),
    notes: "",
    onNotesChange: fn(),

    onCancel: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NewApplicationTemplate>;

export const WithError: Story = {
  args: {
    error: "Le nom de l'entreprise ne peut pas être vide.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Le nom de l'entreprise ne peut pas être vide.")).toBeInTheDocument();
  },
};

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("JobTracker")).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Nouvelle candidature" })).toBeInTheDocument();
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();

    const companyInput = canvas.getByLabelText("Entreprise");
    await expect(companyInput).toBeRequired();
    await userEvent.type(companyInput, "S");
    await expect(args.onCompanyChange).toHaveBeenCalledWith("Nova TechS");

    const positionInput = canvas.getByLabelText("Poste");
    await expect(positionInput).toBeRequired();
    await userEvent.type(positionInput, "I");
    await expect(args.onPositionChange).toHaveBeenCalledWith("Dev. Full-StackI");

    const offerUrlInput = canvas.getByLabelText("Lien de l'offre");
    await userEvent.type(offerUrlInput, "h");
    await expect(args.onOfferUrlChange).toHaveBeenCalledWith("h");

    const notesInput = canvas.getByLabelText("Notes");
    await userEvent.type(notesInput, "N");
    await expect(args.onNotesChange).toHaveBeenCalledWith("N");

    await userEvent.click(canvas.getByRole("button", { name: "Annuler" }));
    await expect(args.onCancel).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("button", { name: "Enregistrer" }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
