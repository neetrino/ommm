import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
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
  const tAdmin = await getTranslations("adminPages.home");
  const cookie = (await headers()).get("cookie") ?? "";

  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);
  if (!meRes.ok) {
    return (
      <div className="pt-6 sm:pt-8">
        <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/90 p-8 text-amber-950 backdrop-blur-md">
          <p className="font-serif text-lg font-semibold">
            {tAdmin("signInPrompt")}
          </p>
          <Link href="/login" className="ommm-cta-primary mt-6 inline-flex text-sm">
            {tCommon("login")}
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdminDashboardRole(meRes.data.user.role)) {
    redirectToRoleHome(locale, meRes.data.user.role);
  }

  return <AdminDashboardMetrics />;
}
