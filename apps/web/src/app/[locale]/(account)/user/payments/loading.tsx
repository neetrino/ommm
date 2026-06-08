"use client";

import { useTranslations } from "next-intl";
import { MemberContentFrame } from "@/components/layout/member-content-frame";

export default function UserPaymentsLoading() {
  const t = useTranslations("userPages.payments");

  return (
    <MemberContentFrame>
      <section className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
        <p className="text-sm text-sage-600">{t("loading")}</p>
      </section>
    </MemberContentFrame>
  );
}
