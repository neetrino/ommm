import { expect, test } from "@playwright/test";

test.describe("Marketing package route stability", () => {
  test("package route stays reachable across repeated loads", async ({ page }) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await page.goto("/en/package", { waitUntil: "domcontentloaded" });
      expect(response, `attempt ${attempt + 1} should receive a response`).not.toBeNull();
      expect(response?.status(), `attempt ${attempt + 1} should not 404`).not.toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.reload({ waitUntil: "domcontentloaded" });
    }
  });

  test("admin packages route does not 404 when API is up", async ({ page }) => {
    const response = await page.goto("/en/admin/packages", { waitUntil: "domcontentloaded" });
    expect(response).not.toBeNull();
    expect(response?.status()).not.toBe(404);
  });
});
