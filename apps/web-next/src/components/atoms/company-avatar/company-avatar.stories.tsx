import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { statusColors } from "@job-tracker/design-tokens";
import { CompanyAvatar } from "./company-avatar";

const meta: Meta<typeof CompanyAvatar> = {
  title: "Atoms/CompanyAvatar",
  component: CompanyAvatar,
  args: {
    initials: "AC",
    backgroundColor: statusColors.offer_open.bg,
    textColor: statusColors.offer_open.text,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyAvatar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("AC")).toBeInTheDocument();
  },
};

export const AnotherCompany: Story = {
  args: {
    initials: "OR",
    backgroundColor: statusColors.technical_interview.bg,
    textColor: statusColors.technical_interview.text,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("OR")).toBeInTheDocument();
  },
};

export const Circle: Story = {
  args: {
    initials: "YM",
    shape: "circle",
    backgroundColor: statusColors.hr_interview.bg,
    textColor: statusColors.hr_interview.text,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("YM")).toHaveStyle({ borderRadius: "50%" });
  },
};

export const Large: Story = {
  args: {
    initials: "NT",
    size: "lg",
    backgroundColor: statusColors.application_sent.bg,
    textColor: statusColors.application_sent.text,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("NT")).toHaveStyle({ width: "48px", height: "48px" });
  },
};
