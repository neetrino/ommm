import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default async function AdminPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.packages" });

  return (
    <AdminContentFrame>
      <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-sage-700">
        {t("title")}: Packages module is empty. New logic will be rebuilt from zero.
      </div>
    </AdminContentFrame>
  );
}
