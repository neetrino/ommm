import { redirect } from "next/navigation";

export default async function AdminMembershipsPage({
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
  const qs = query.toString();
  redirect(qs ? `/${locale}/admin/packages?${qs}` : `/${locale}/admin/packages`);
}
