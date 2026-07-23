import { Suspense } from "react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { redirectIfAuthenticatedToRoleHome } from "@/server/redirect-to-role-home";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  await connection();
  const { locale } = await params;
  await redirectIfAuthenticatedToRoleHome(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
      <LoginForm />
    </Suspense>
  );
}
