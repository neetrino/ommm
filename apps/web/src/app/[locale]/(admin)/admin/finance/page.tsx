import { redirect } from "next/navigation";
import {
  FINANCE_SECTION_HREF,
  resolveFinanceLegacyTabRedirect,
} from "@/components/admin/admin-finance-module";

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

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (key === "tab") {
      continue;
    }
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized !== undefined && normalized.length > 0) {
      query.set(key, normalized);
    }
  }

  const qs = query.toString();
  redirect(qs ? `/${locale}${targetPath}?${qs}` : `/${locale}${targetPath}`);
}
