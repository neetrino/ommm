import { Suspense } from "react";
import { MemberUserHomePageContentDeferred } from "@/components/account/account-deferred-server-sections";
import { MemberPageLoading } from "@/components/account/member-page-loading";

/** Member `/user` — desktop dashboard (legacy), mobile account hub. */
export default async function UserAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<MemberPageLoading />}>
      <MemberUserHomePageContentDeferred locale={locale} />
    </Suspense>
  );
}
