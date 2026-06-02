import { redirect } from "next/navigation";

/** Legacy member home URL — canonical dashboard is `/dashboard`. */
export default async function UserHomeRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard`);
}
