"use client";

import { useTranslations } from "next-intl";
import { useCallTasksDue } from "@/hooks/use-call-tasks-due";
import { Link } from "@/i18n/navigation";

type AdminCallTasksDueBannerProps = {
  listHref: string;
};

export function AdminCallTasksDueBanner({ listHref }: AdminCallTasksDueBannerProps) {
  const t = useTranslations("adminPages.calls");
  const { items, loading } = useCallTasksDue(true);
  if (loading || items.length === 0) {
    return null;
  }

  return (
    <p
      className="mb-4 rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
      role="status"
    >
      <Link href={listHref} className="font-semibold underline-offset-2 hover:underline">
        {t("title")} ({items.length})
      </Link>
    </p>
  );
}
