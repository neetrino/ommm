import { expect, request as playwrightRequest, test } from "@playwright/test";
import {
  E2E_API_ORIGIN,
  bookSession,
  cancelBooking,
  clearCancelIntent,
  findBookableSession,
  isApiReachable,
  loginApiUser,
  registerCancelIntent,
} from "./helpers/realtime-api";
import {
  trackSchedulePublicRefetches,
  waitForInitialScheduleLoad,
} from "./helpers/schedule-refetch";

test.describe.configure({ mode: "serial" });

test.describe("SSE realtime (requires API on :4000)", () => {
  let apiReady = false;

  test.beforeAll(async ({ request }) => {
    apiReady = await isApiReachable(request);
  });

  test.beforeEach(() => {
    test.skip(!apiReady, `API not reachable at ${E2E_API_ORIGIN}`);
  });

  test("guest schedule opens public SSE stream via Next proxy", async ({ page }) => {
    const sseRequest = page.waitForRequest(
      (req) => req.url().includes("/api/v1/realtime/public"),
      { timeout: 20_000 },
    );

    await page.goto("/en/schedule");
    const request = await sseRequest;
    expect(request.url()).toContain("/api/v1/realtime/public");
  });

  test("cross-user booking triggers guest schedule refetch via SSE", async ({
    page,
    request,
  }) => {
    let session: Awaited<ReturnType<typeof findBookableSession>>;
    try {
      session = await findBookableSession(request, 1);
    } catch (error) {
      test.skip(
        true,
        error instanceof Error ? error.message : "No bookable session today",
      );
      return;
    }
    const tracker = trackSchedulePublicRefetches(page);

    const initialLoad = waitForInitialScheduleLoad(page);
    await page.goto("/en/schedule");
    await initialLoad;
    await expect(page.getByText(session.className, { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    const initialCount = tracker.getCount();
    expect(initialCount).toBeGreaterThan(0);

    const memberApi = await playwrightRequest.newContext();
    try {
      await loginApiUser(memberApi, "member2@ommm.local");
    } catch {
      await memberApi.dispose();
      test.skip(true, "member2@ommm.local unavailable — run db seed for demo users");
      return;
    }

    let bookingId: string;
    try {
      ({ bookingId } = await bookSession(memberApi, session.id));
    } catch {
      await memberApi.dispose();
      test.skip(true, "member2 could not book — active package or demo seed required");
      return;
    }

    try {
      await tracker.waitForNext();
      await expect(page.getByText(session.className, { exact: true })).toBeVisible();
    } finally {
      await cancelBooking(memberApi, bookingId);
      await memberApi.dispose();
    }
  });

  test("cancel-intent hold updates guest schedule without manual refresh", async ({
    page,
    request,
  }) => {
    let session: Awaited<ReturnType<typeof findBookableSession>>;
    try {
      session = await findBookableSession(request, 1);
    } catch (error) {
      test.skip(
        true,
        error instanceof Error ? error.message : "No bookable session today",
      );
      return;
    }
    const memberApi = await playwrightRequest.newContext();

    try {
      await loginApiUser(memberApi, "member2@ommm.local");
    } catch {
      await memberApi.dispose();
      test.skip(true, "member2@ommm.local unavailable — run db seed for demo users");
      return;
    }

    let bookingId: string;
    try {
      ({ bookingId } = await bookSession(memberApi, session.id));
    } catch {
      await memberApi.dispose();
      test.skip(true, "member2 could not book — active package or demo seed required");
      return;
    }

    const tracker = trackSchedulePublicRefetches(page);

    const initialLoad = waitForInitialScheduleLoad(page);
    await page.goto("/en/schedule");
    await initialLoad;
    await expect(page.getByText(session.className, { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    const initialCount = tracker.getCount();
    expect(initialCount).toBeGreaterThan(0);

    await registerCancelIntent(memberApi, bookingId);

    try {
      await tracker.waitForNext();
      const row = page
        .getByRole("listitem")
        .filter({ hasText: session.className });
      await expect(row.getByText(/^Full$/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await clearCancelIntent(memberApi, bookingId);
      await cancelBooking(memberApi, bookingId);
      await memberApi.dispose();
    }
  });
});
