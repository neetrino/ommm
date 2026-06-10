import type { Page } from "@playwright/test";

function isSchedulePublicResponse(url: string): boolean {
  return url.includes("/schedule/public");
}

/** Waits for the first successful `schedule/public` response after navigation. */
export async function waitForInitialScheduleLoad(
  page: Page,
  timeoutMs = 20_000,
): Promise<void> {
  await page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      isSchedulePublicResponse(response.url()) &&
      response.ok(),
    { timeout: timeoutMs },
  );
}

/** Counts client refetches of the public schedule (via Next `/api/v1` proxy). */
export function trackSchedulePublicRefetches(page: Page): {
  getCount: () => number;
  waitForNext: (timeoutMs?: number) => Promise<void>;
} {
  let count = 0;

  page.on("response", (response) => {
    if (
      response.request().method() === "GET" &&
      isSchedulePublicResponse(response.url()) &&
      response.ok()
    ) {
      count += 1;
    }
  });

  return {
    getCount: () => count,
    waitForNext: async (timeoutMs = 15_000) => {
      const baseline = count;
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (count > baseline) {
          return;
        }
        await page.waitForTimeout(200);
      }
      throw new Error(
        `Timed out waiting for schedule/public refetch (count stayed at ${baseline})`,
      );
    },
  };
}
