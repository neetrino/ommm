import { redirect } from "next/navigation";

export default async function CoachSettingsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/coach/profile`);
}
