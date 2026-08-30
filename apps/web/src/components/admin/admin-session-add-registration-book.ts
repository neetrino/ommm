import { pickOwnerBookablePackageId } from "@/components/admin/admin-session-add-registration.helpers";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";
import { ApiError, apiFetch } from "@/lib/api";

export type BookClientOnSessionResult =
  | { ok: true }
  | { ok: false; message: string; noPackage: boolean };

export async function bookClientOnSession(params: {
  clientId: string;
  sessionId: string;
  noPackageMessage: string;
  fallbackError: string;
}): Promise<BookClientOnSessionResult> {
  try {
    const packages = await apiFetch<EligibleBookingPackage[]>(
      `/clients/${params.clientId}/sessions/${params.sessionId}/eligible-packages`,
    );
    const userPackageId = pickOwnerBookablePackageId(packages);
    if (userPackageId === null) {
      return { ok: false, message: params.noPackageMessage, noPackage: true };
    }
    await apiFetch(`/clients/${params.clientId}/bookings`, {
      method: "POST",
      body: JSON.stringify({ sessionId: params.sessionId, userPackageId }),
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof ApiError ? err.message : params.fallbackError,
      noPackage: false,
    };
  }
}
