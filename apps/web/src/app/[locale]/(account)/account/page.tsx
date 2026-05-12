import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { homePathForRole } from "@/lib/role-home";
import { serverApiJson } from "@/lib/server-api";
import { redirect } from "next/navigation";

type MeResponse = {
  user: { role: string };
};

export default async function AccountHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tDash = await getTranslations({ locale, namespace: "account.dashboard" });
  const cookie = (await headers()).get("cookie") ?? "";

  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);

  if (meRes.ok) {
    redirect(`/${locale}${homePathForRole(meRes.data.user.role)}`);
  }

  return (
    <div className="pt-6 sm:pt-8">
      <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/90 p-8 text-amber-950 backdrop-blur-md">
        <p className="font-serif text-lg font-semibold">{tDash("signIn.title")}</p>
        <p className="mt-2 text-sm text-amber-900/90">{tDash("signIn.body")}</p>
        <Link href="/login" className="ommm-cta-primary mt-6 inline-flex">
          {tCommon("login")}
        </Link>
      </div>
    </div>
  );
}
