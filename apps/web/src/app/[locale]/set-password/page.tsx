import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AccountChangePasswordForm } from "@/components/account/account-change-password-form";
import { homePathForRole } from "@/lib/role-home";
import { serverApiJson } from "@/lib/server-api";

type MePayload = {
  user: {
    role: string;
    hasPassword: boolean;
  };
};

export default async function SetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MePayload>("/users/me", cookie);
  if (!res.ok) {
    redirect(`/${locale}/login`);
  }
  if (res.data.user.hasPassword) {
    redirect(`/${locale}${homePathForRole(res.data.user.role)}`);
  }
  const t = await getTranslations({ locale, namespace: "setPasswordPage" });

  return (
    <div className="flex min-h-screen items-center justify-center ommm-bg-auth px-4 py-12">
      <div className="ommm-card w-full max-w-md p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
          {t("title")}
        </h1>
        <p className="ommm-body-muted mt-2">{t("lead")}</p>
        <div className="mt-6">
          <AccountChangePasswordForm hasPassword={false} />
        </div>
      </div>
    </div>
  );
}
