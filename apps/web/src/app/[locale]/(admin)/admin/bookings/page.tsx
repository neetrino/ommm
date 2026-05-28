import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminBookingsManagement } from "@/components/admin/admin-bookings-management";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<{
    rows: Array<{
      id: string;
      recordType: "BOOKING" | "WAITLIST";
      status: "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";
      attendanceStatus: "ATTENDED" | "NOT_ATTENDED" | "NO_SHOW" | "LATE_CANCEL" | null;
      paymentStatus: "PAID" | "CASH" | "UNPAID" | "REFUNDED";
      channel: "WEBSITE" | "APP";
      registerDate: string;
      user: { id: string; name: string | null; email: string; phone: string | null };
      session: {
        id: string;
        startsAt: string;
        endsAt: string;
        classType: { id: string; name: string };
        coach: { id: string; name: string | null };
      };
      membership: {
        planName: string;
        sessionsRemaining: number | null;
        sessionsPerMonth: number | null;
        isUnlimited: boolean;
      } | null;
      latestNote: {
        id: string;
        body: string;
        authorName: string | null;
        createdAt: string;
      } | null;
    }>;
    summary: {
      total: number;
      booked: number;
      completed: number;
      cancelled: number;
      waitlisted: number;
      today: number;
    };
    filterOptions: {
      classTypes: Array<{ id: string; name: string }>;
      coaches: Array<{ id: string; name: string }>;
    };
  }>("/bookings/admin/management", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: res.status })}
      </div>
    );
  }

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <AdminBookingsManagement locale={locale} initial={res.data} />
    </AccountPageFrame>
  );
}
