"use client";

import { useTranslations } from "next-intl";
import { MemberContentFrame } from "@/components/layout/member-content-frame";

export default function UserPaymentsError() {
  const t = useTranslations("userPages.payments");

  return (
    <MemberContentFrame>
      <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
        <p className="font-medium">{t("unexpectedErrorTitle")}</p>
        <p className="mt-1">{t("unexpectedErrorDescription")}</p>
      </section>
    </MemberContentFrame>
  );
}
