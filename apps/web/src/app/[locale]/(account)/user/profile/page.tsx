import { RoleProfilePage } from "@/components/account/role-profile-page";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <RoleProfilePage locale={locale} />;
}
