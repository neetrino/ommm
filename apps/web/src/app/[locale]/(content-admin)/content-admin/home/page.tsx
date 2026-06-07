import { Link } from "@/i18n/navigation";
import { WORKSPACE_ROUTE_PREFETCH } from "@/lib/workspace-nav-link";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default async function ContentAdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contentAdminPages.home" });

  return (
    <AdminContentFrame>
      <section className="flex flex-wrap gap-3">
        <Link
          href="/content-admin/content"
          prefetch={WORKSPACE_ROUTE_PREFETCH}
          className="ommm-cta-primary inline-flex text-sm"
        >
          {t("openContent")}
        </Link>
        <Link
          href="/content-admin/profile"
          prefetch={WORKSPACE_ROUTE_PREFETCH}
          className="ommm-cta-ghost inline-flex text-sm"
        >
          {t("openProfile")}
        </Link>
      </section>
    </AdminContentFrame>
  );
}
