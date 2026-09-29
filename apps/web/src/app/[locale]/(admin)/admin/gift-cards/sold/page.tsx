import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import {
  AdminGiftPlacedCardsPage,
  type PlacedGiftCard,
} from "@/components/admin/admin-gift-placed-cards";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminGiftCardsSoldPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<PlacedGiftCard[]>("/gift-cards/admin", cookie);

  if (!res.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {res.status === 401 || res.status === 403
            ? t("errorAuth")
            : t("errorLoad", { status: res.status })}
        </div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <AdminGiftPlacedCardsPage cards={res.data} />
    </AdminContentFrame>
  );
}
