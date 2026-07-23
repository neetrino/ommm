import { redirect } from "next/navigation";

export default async function UserSettingsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/user/profile`);
}
