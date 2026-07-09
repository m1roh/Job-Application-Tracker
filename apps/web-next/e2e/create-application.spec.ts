import { expect, test } from "@playwright/test";
import { createApplication, uniqueCompanyName } from "./fixtures";

test("creates a job application and shows it on the dashboard", async ({ page }) => {
  const company = uniqueCompanyName("Solstice Labs");

  await createApplication(page, { company, position: "Ingénieur Backend" });

  const card = page.locator("button", { hasText: company });
  await expect(card).toBeVisible();
  await expect(card.getByText("À contacter")).toBeVisible();
});
