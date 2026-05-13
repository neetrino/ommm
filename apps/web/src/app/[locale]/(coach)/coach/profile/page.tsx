import { RoleProfilePage } from "@/components/account/role-profile-page";

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <RoleProfilePage
      locale={locale}
      showRole
      workspaceNoteVariant="coach"
    />
  );
}
