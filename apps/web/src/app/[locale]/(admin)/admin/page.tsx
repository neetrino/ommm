import { redirect } from "next/navigation";

export default async function AdminIndexRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/home`);
}
