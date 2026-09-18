"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const t = useTranslations("common");
  return (
    <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
      <RegisterForm />
    </Suspense>
  );
}
