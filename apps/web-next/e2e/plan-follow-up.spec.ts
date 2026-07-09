import { expect, test } from "@playwright/test";
import { createApplication, uniqueCompanyName } from "./fixtures";

function isoDatePlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

test("defaults the follow-up date to J+15 but saves the edited date", async ({ page }) => {
  const company = uniqueCompanyName("Globex");

  await createApplication(page, { company, position: "Ingénieur QA" });
  await page.getByText(company).click();
  await page.getByRole("button", { name: "Candidature envoyée" }).click();

  const followUpInput = page.getByLabel("Planifier une relance");
  await expect(followUpInput).toHaveValue(isoDatePlusDays(15));

  const editedDate = isoDatePlusDays(30);
  await followUpInput.fill(editedDate);
  await page.getByRole("button", { name: "Planifier" }).click();

  const [year, month, day] = editedDate.split("-");
  const expectedLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));

  await expect(page.getByText(expectedLabel)).toBeVisible();
});
