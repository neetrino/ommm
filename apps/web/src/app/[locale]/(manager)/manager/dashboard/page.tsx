import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminDashboardMetrics } from "@/components/admin/admin-dashboard-metrics";
import { getSessionAuth } from "@/server/require-role-layout";

export default async function ManagerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tHome = await getTranslations({ locale, namespace: "managerPages.home" });
  const session = await getSessionAuth();

  if (!session.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          <p>{tHome("signInRequired")}</p>
          <Link href="/login" className="ommm-cta-primary mt-4 inline-flex text-sm">
            {tCommon("login")}
          </Link>
        </div>
      </AdminContentFrame>
    );
  }

  return <AdminDashboardMetrics locale={locale} includeFinance={false} />;
}
