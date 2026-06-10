import type { APIRequestContext } from "@playwright/test";

export const E2E_API_ORIGIN =
  process.env.E2E_API_ORIGIN?.trim() || "http://localhost:4000";

export const DEMO_USER_PASSWORD = "Demo1234!";

export type PublicScheduleRow = {
  id: string;
  className: string;
  availableSpots: number;
  status: string;
};

export type UserBookingRow = {
  id: string;
  sessionId: string;
  status?: string;
};

function startOfLocalDay(input: Date): Date {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(input: Date, days: number): Date {
  const d = new Date(input);
  d.setDate(d.getDate() + days);
  return d;
}

function endOfLocalDay(input: Date): Date {
  const d = new Date(input);
  d.setHours(23, 59, 59, 999);
  return d;
}

function buildPublicScheduleRangeQuery(rangeDays = 30): string {
  const from = startOfLocalDay(new Date());
  const to = endOfLocalDay(addDays(from, rangeDays));
  return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
}

export async function isApiReachable(
  request: APIRequestContext,
): Promise<boolean> {
  try {
    const res = await request.get(`${E2E_API_ORIGIN}/v1/health`, {
      timeout: 5_000,
    });
    return res.ok();
  } catch {
    return false;
  }
}

export async function loginApiUser(
  request: APIRequestContext,
  email: string,
): Promise<void> {
  const res = await request.post(`${E2E_API_ORIGIN}/v1/auth/login`, {
    data: { email, password: DEMO_USER_PASSWORD },
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Login failed for ${email}: ${res.status()} ${body}`);
  }
}

export async function fetchPublicSchedule(
  request: APIRequestContext,
): Promise<PublicScheduleRow[]> {
  const res = await request.get(
    `${E2E_API_ORIGIN}/v1/schedule/public?${buildPublicScheduleRangeQuery()}`,
  );
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Public schedule failed: ${res.status()} ${body}`);
  }
  return (await res.json()) as PublicScheduleRow[];
}

/** First ACTIVE row with at least `minSpots` available (works without seed data). */
export async function findBookableSession(
  request: APIRequestContext,
  minSpots = 1,
): Promise<PublicScheduleRow> {
  const rows = await fetchPublicSchedule(request);
  const match = rows.find(
    (row) =>
      row.status === "ACTIVE" &&
      row.availableSpots >= minSpots,
  );
  if (match === undefined) {
    throw new Error(
      `No ACTIVE public session with >= ${minSpots} spots in schedule window`,
    );
  }
  return match;
}

export async function bookSession(
  request: APIRequestContext,
  sessionId: string,
): Promise<{ bookingId: string }> {
  const res = await request.post(
    `${E2E_API_ORIGIN}/v1/bookings/sessions/${sessionId}`,
    { data: {} },
  );
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Book failed: ${res.status()} ${body}`);
  }
  const payload = (await res.json()) as { id: string };
  return { bookingId: payload.id };
}

export async function cancelBooking(
  request: APIRequestContext,
  bookingId: string,
): Promise<void> {
  const res = await request.delete(
    `${E2E_API_ORIGIN}/v1/bookings/${bookingId}`,
  );
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Cancel failed: ${res.status()} ${body}`);
  }
}

export async function listMyBookings(
  request: APIRequestContext,
): Promise<UserBookingRow[]> {
  const res = await request.get(`${E2E_API_ORIGIN}/v1/bookings/me`);
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`List bookings failed: ${res.status()} ${body}`);
  }
  return (await res.json()) as UserBookingRow[];
}

export async function findActiveBookingForUser(
  request: APIRequestContext,
  email: string,
): Promise<{ booking: UserBookingRow; session: PublicScheduleRow }> {
  await loginApiUser(request, email);
  const [bookings, schedule] = await Promise.all([
    listMyBookings(request),
    fetchPublicSchedule(request),
  ]);
  const scheduleById = new Map(schedule.map((row) => [row.id, row]));

  const booking = bookings.find(
    (row) =>
      (row.status === undefined || row.status === "BOOKED") &&
      scheduleById.has(row.sessionId),
  );
  if (booking === undefined) {
    throw new Error(`No active booking on public schedule for ${email}`);
  }

  const session = scheduleById.get(booking.sessionId);
  if (session === undefined) {
    throw new Error(`Session ${booking.sessionId} missing from public schedule`);
  }

  return { booking, session };
}

export async function registerCancelIntent(
  request: APIRequestContext,
  bookingId: string,
): Promise<void> {
  const res = await request.post(
    `${E2E_API_ORIGIN}/v1/bookings/${bookingId}/cancel-intent`,
  );
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Cancel intent failed: ${res.status()} ${body}`);
  }
}

export async function clearCancelIntent(
  request: APIRequestContext,
  bookingId: string,
): Promise<void> {
  const res = await request.delete(
    `${E2E_API_ORIGIN}/v1/bookings/${bookingId}/cancel-intent`,
  );
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Clear cancel intent failed: ${res.status()} ${body}`);
  }
}
