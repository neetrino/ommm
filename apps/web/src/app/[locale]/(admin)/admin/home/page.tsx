import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  isAdminDashboardRole,
} from "@/lib/role-home";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { serverApiJson } from "@/lib/server-api";
import { AdminDashboardMetrics } from "./admin-dashboard-metrics";

type MeResponse = {
  user: { role: string; name: string | null; email: string };
};

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations("common");
  const cookie = (await headers()).get("cookie") ?? "";

  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);
  if (!meRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>Sign in to open the admin dashboard.</p>
        <Link href="/login" className="ommm-cta-primary mt-4 inline-flex text-sm">
          {tCommon("login")}
        </Link>
      </div>
    );
  }

  if (!isAdminDashboardRole(meRes.data.user.role)) {
    redirectToRoleHome(locale, meRes.data.user.role);
  }

  if (meRes.data.user.role === "CONTENT_ADMIN") {
    redirect(`/${locale}/admin/content`);
  }

  return <AdminDashboardMetrics />;
}
