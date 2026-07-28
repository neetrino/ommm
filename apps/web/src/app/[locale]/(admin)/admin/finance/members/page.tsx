import { redirect } from "next/navigation";

/** Members finance tab removed — keep route for old bookmarks. */
export default async function AdminFinanceMembersRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/finance/overview`);
}
