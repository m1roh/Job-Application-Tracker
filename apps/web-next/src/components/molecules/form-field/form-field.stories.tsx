import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Input } from "../../atoms/input/input";
import { FormField } from "./form-field";

const meta: Meta<typeof FormField> = {
  title: "Molecules/FormField",
  component: FormField,
  args: {
    id: "company",
    label: "Entreprise",
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const WithError: Story = {
  args: {
    error: "Le nom de l'entreprise est obligatoire",
    children: <Input placeholder="Nom de l'entreprise" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Nom de l'entreprise");
    const errorText = canvas.getByText("Le nom de l'entreprise est obligatoire");

    await expect(errorText).toBeInTheDocument();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-describedby", errorText.id);
    await expect(canvas.getByText("Entreprise")).toHaveAttribute("for", input.id);
  },
};

export const WithHelpText: Story = {
  args: {
    helpText: "Nom légal ou nom d'usage de l'entreprise",
    children: <Input placeholder="Nom de l'entreprise" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Nom de l'entreprise");
    const helpText = canvas.getByText("Nom légal ou nom d'usage de l'entreprise");

    await expect(helpText).toBeInTheDocument();
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).toHaveAttribute("aria-describedby", helpText.id);
  },
};
