import { redirect } from "next/navigation";

export default async function ManagerSettingsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/manager/profile`);
}
