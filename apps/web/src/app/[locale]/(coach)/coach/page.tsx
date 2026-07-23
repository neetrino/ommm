import { redirect } from "next/navigation";

export default async function CoachIndexRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/coach/home`);
}
