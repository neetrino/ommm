import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminWaitlistManagement } from "@/components/admin/admin-waitlist-management";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type AdminWaitlistRow = {
  id: string;
  status: "ACTIVE" | "OFFERED" | "EXPIRED" | "CONVERTED" | "REMOVED";
  waitlistDate: string;
  sessionWaitlistCount: number;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    classType: { id: string; name: string };
  };
};

export default async function AdminWaitlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.waitlists" });
  const cookie = (await headers()).get("cookie") ?? "";
  const response = await serverApiJson<AdminWaitlistRow[]>(
    "/waitlist/admin/active?take=250",
    cookie,
  );
  const initialRows = response.ok ? response.data : [];
  const initialLoadError = response.ok
    ? null
    : response.status === 401 || response.status === 403
      ? t("errorAuth")
      : t("errorLoad", { status: response.status });

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <div className="mt-2">
        <AdminWaitlistManagement
          locale={locale}
          initialRows={initialRows}
          initialLoadError={initialLoadError}
        />
      </div>
    </AccountPageFrame>
  );
}
