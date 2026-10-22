import { expect, test } from "@playwright/test";
import { stubTurnstile } from "./fixtures";

const SAMPLE_URL = "https://x.com/historyinmemes/status/1790637656616943991";

test("protected account shows the correct error card (mocked API)", async ({ page }) => {
  await stubTurnstile(page);
  await page.route("**/api/resolve*", (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: "protected_account", message: "mock" }),
    }),
  );

  await page.goto("/");
  await page.getByLabel("Tweet link").fill(SAMPLE_URL);
  await page.getByRole("button", { name: "Download", exact: true }).click();

  await expect(page.getByText("This account is private")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try another link" })).toBeVisible();
});
