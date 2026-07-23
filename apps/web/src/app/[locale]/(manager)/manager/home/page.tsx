import { redirect } from "next/navigation";

export default async function ManagerHomeRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/manager/dashboard`);
}
