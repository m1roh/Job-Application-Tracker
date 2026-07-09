import { expect, test } from "@playwright/test";
import { createApplication, uniqueCompanyName } from "./fixtures";

test("cancels without deleting, then deletes on confirm and redirects to the dashboard", async ({ page }) => {
  const company = uniqueCompanyName("Acme Corp");

  await createApplication(page, { company, position: "Ingénieur Backend" });
  await page.getByText(company).click();

  await page.getByRole("button", { name: "Supprimer la candidature" }).click();
  await expect(page.getByText("Supprimer définitivement cette candidature ?")).toBeVisible();

  await page.getByRole("button", { name: "Annuler" }).click();
  await expect(page.getByRole("button", { name: "Supprimer la candidature" })).toBeVisible();
  await expect(page.getByText(company)).toBeVisible();

  await page.getByRole("button", { name: "Supprimer la candidature" }).click();
  await page.getByRole("button", { name: "Confirmer" }).click();

  await page.waitForURL("/");
  await expect(page.getByText(company)).not.toBeVisible();
});
