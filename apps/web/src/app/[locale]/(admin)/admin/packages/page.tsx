import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";

export default async function AdminPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.packages" });

  return (
    <AdminContentFrame description={t("description")}>
      <AdminSectionShell>
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <h1 className="font-serif text-2xl font-semibold text-sage-900">
            {t("title")}
          </h1>
          <p className="max-w-md text-sm text-sage-600">{t("emptyState")}</p>
        </div>
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
