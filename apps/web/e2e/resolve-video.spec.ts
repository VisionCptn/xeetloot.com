import { expect, test } from "@playwright/test";
import { SAMPLE_VIDEO_MEDIA, stubTurnstile } from "./fixtures";

const SAMPLE_URL = "https://x.com/historyinmemes/status/1790637656616943991";

test("paste a fixture tweet URL and see quality rows", async ({ page }) => {
  await stubTurnstile(page);
  await page.route("**/api/resolve*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SAMPLE_VIDEO_MEDIA) }),
  );

  await page.goto("/");
  await page.getByLabel("Tweet link").fill(SAMPLE_URL);
  await page.getByRole("button", { name: "Download", exact: true }).click();

  await expect(page.getByText("728×720")).toBeVisible();
  await expect(page.getByText("364×360")).toBeVisible();
  await expect(page.getByText("272×270")).toBeVisible();
  await expect(page.getByText("720p")).toBeVisible();
});
