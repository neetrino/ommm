import { redirect } from "next/navigation";

/** Legacy route — password setup lives in account profile settings. */
export default async function SetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/user/profile`);
}
