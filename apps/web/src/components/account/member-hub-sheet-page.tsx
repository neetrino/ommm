import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { MemberAccountHubSectionSheet } from "@/components/account/member-account-hub-section-sheet";

type MemberHubSheetPageProps = {
  locale: string;
  titleNamespace: string;
  children: ReactNode;
};

/** Wraps intercepted member route content in the mobile bottom sheet. */
export async function MemberHubSheetPage({
  locale,
  titleNamespace,
  children,
}: MemberHubSheetPageProps) {
  const t = await getTranslations({ locale, namespace: titleNamespace });
  const tShell = await getTranslations({ locale, namespace: "dashboard.shell" });

  return (
    <MemberAccountHubSectionSheet
      title={t("title")}
      closeLabel={tShell("closeMenu")}
      backdropCloseLabel={tShell("closeMenuOverlay")}
    >
      {children}
    </MemberAccountHubSectionSheet>
  );
}
