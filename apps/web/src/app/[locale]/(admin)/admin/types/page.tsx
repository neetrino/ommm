import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminTypesManagement } from "@/components/admin/admin-types-management";
import { serverApiJson } from "@/lib/server-api";

type AdminClassTypeRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default async function AdminTypesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.classes" });
  const cookie = (await headers()).get("cookie") ?? "";
  const typesRes = await serverApiJson<AdminClassTypeRow[]>("/classes/types", cookie);

  if (!typesRes.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {typesRes.status === 401 || typesRes.status === 403
            ? t("errorTypesAuth")
            : t("errorTypesLoad", { status: typesRes.status })}
        </div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <AdminTypesManagement initialTypes={typesRes.data} />
    </AdminContentFrame>
  );
}
