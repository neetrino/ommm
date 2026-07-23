import { redirect } from "next/navigation";
import {
  PACKAGE_MODAL_QUERY_KEY,
  PACKAGE_MODAL_TYPES_VALUE,
} from "@/components/admin/admin-packages-url";

export default async function AdminTypesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized !== undefined && normalized.length > 0) {
      query.set(key, normalized);
    }
  }
  if (query.get(PACKAGE_MODAL_QUERY_KEY) !== PACKAGE_MODAL_TYPES_VALUE) {
    query.set(PACKAGE_MODAL_QUERY_KEY, PACKAGE_MODAL_TYPES_VALUE);
  }
  const qs = query.toString();
  redirect(qs ? `/${locale}/admin/packages?${qs}` : `/${locale}/admin/packages?${PACKAGE_MODAL_QUERY_KEY}=${PACKAGE_MODAL_TYPES_VALUE}`);
}
