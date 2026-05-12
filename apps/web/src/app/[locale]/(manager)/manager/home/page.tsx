import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { isManagerDashboardRole } from "@/lib/role-home";
import { serverApiJson } from "@/lib/server-api";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";

type MeResponse = {
  user: { role: string; name: string | null };
};

export default async function ManagerHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const cookie = (await headers()).get("cookie") ?? "";

  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);
  if (!meRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>Sign in to open the manager workspace.</p>
        <Link href="/login" className="ommm-cta-primary mt-4 inline-flex text-sm">
          {tCommon("login")}
        </Link>
      </div>
    );
  }

  if (!isManagerDashboardRole(meRes.data.user.role)) {
    redirectToRoleHome(locale, meRes.data.user.role);
  }

  const name = meRes.data.user.name?.trim();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Manager workspace
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Hi{name ? `, ${name}` : ""} — studio operations overview. Use Bookings
        and Clients when your account has access.
      </p>
      <section className="mt-8 rounded-[24px] border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
        <p className="font-medium text-zinc-900">Next steps</p>
        <p className="mt-2 text-zinc-600">
          Manager-specific reports can extend this page. Members and coaches use
          separate home routes.
        </p>
      </section>
    </div>
  );
}
