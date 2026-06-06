import { redirect } from "next/navigation";
import {
  FINANCE_SECTION_HREF,
  resolveFinanceLegacyTabRedirect,
} from "@/components/admin/admin-finance-module";
import { buildSanitizedFinanceSectionQueryString } from "@/components/admin/admin-finance-url";

export default async function AdminFinanceIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const tab = Array.isArray(search.tab) ? search.tab[0] : search.tab;
  const legacySection = resolveFinanceLegacyTabRedirect(tab);
  const targetSection = legacySection ?? "overview";
  const targetPath = FINANCE_SECTION_HREF[targetSection];
  const qs = buildSanitizedFinanceSectionQueryString(targetSection, search);
  redirect(qs ? `/${locale}${targetPath}?${qs}` : `/${locale}${targetPath}`);
}
