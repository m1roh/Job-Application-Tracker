import type { Page } from "@playwright/test";

export type NewApplicationInput = {
  company: string;
  position: string;
};

const RANDOM_SUFFIX_MAX = 10_000;

export function uniqueCompanyName(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * RANDOM_SUFFIX_MAX)}`;
}

export async function createApplication(page: Page, input: NewApplicationInput): Promise<void> {
  await page.goto("/candidatures/new");
  await page.getByLabel("Entreprise").fill(input.company);
  await page.getByLabel("Poste").fill(input.position);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.waitForURL("/");
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(),
  );
}
