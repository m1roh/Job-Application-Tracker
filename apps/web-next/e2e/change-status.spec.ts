import { expect, test } from "@playwright/test";
import { createApplication, todayLabel, uniqueCompanyName } from "./fixtures";

test("advances the status, records history and auto-fills the application date", async ({ page }) => {
  const company = uniqueCompanyName("Nova Tech");

  await createApplication(page, { company, position: "Ingénieur QA" });
  await page.getByText(company).click();

  await page.getByRole("button", { name: "Candidature envoyée" }).click();

  await expect(page.getByText(todayLabel()).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Entretien RH" })).toBeVisible();

  await page.getByRole("button", { name: "Entretien RH" }).click();

  await expect(page.getByRole("button", { name: "Refusé" })).toBeVisible();
  await expect(page.getByRole("button", { name: "En pause" })).toBeVisible();
});
