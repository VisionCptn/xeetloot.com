import { expect, test } from "@playwright/test";

test("hreflang alternates are present on /tr, including x-default and en", async ({ page }) => {
  await page.goto("/tr");

  const defaultLink = page.locator('link[rel="alternate"][hreflang="x-default"]');
  await expect(defaultLink).toHaveAttribute("href", "https://xeetloot.com");

  const enLink = page.locator('link[rel="alternate"][hreflang="en"]');
  await expect(enLink).toHaveAttribute("href", "https://xeetloot.com");

  const trLink = page.locator('link[rel="alternate"][hreflang="tr"]');
  await expect(trLink).toHaveAttribute("href", "https://xeetloot.com/tr");

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", "https://xeetloot.com/tr");
});

test("/tr serves the Turkish H1 without a locale redirect", async ({ page }) => {
  const response = await page.goto("/tr");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Video");
});
