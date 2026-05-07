import { expect, test } from "@playwright/test";

test.describe("Marketing shell", () => {
  test("home renders hero in English locale", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { level: 1, name: /calm studio/i }),
    ).toBeVisible();
  });

  test("explore route responds", async ({ page }) => {
    const res = await page.goto("/en/explore");
    expect(res?.ok()).toBeTruthy();
  });
});
