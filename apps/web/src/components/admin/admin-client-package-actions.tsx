"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { normalizeUserPackageStatus } from "@/components/account/user-membership-display";
import { canAdjustClientPackageSessions } from "@/components/admin/admin-client-package-sessions-adjuster.helpers";
import { AdminClientPackageFreezeControls } from "@/components/admin/admin-client-package-freeze-controls";
import { AdminClientPackagePastSessionControls } from "@/components/admin/admin-client-package-past-session-controls";
import { AdminClientPackageSessionsAdjuster } from "@/components/admin/admin-client-package-sessions-adjuster";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import { AdminPillTabs } from "@/components/admin/admin-pill-tabs";
import { normalizeUserPackageFreeze } from "@/lib/user-package-freeze";

type PackageActionTab = "freeze" | "add" | "attach";

type AdminClientPackageActionsProps = {
  clientId: string;
  item: ClientSheetPackageItem;
  locale: string;
  allowEditValidity: boolean;
  onSuccess: (message: string) => void;
};

function visiblePackageActionTabs(params: {
  item: ClientSheetPackageItem;
  allowEditValidity: boolean;
}): PackageActionTab[] {
  const freeze = normalizeUserPackageFreeze(params.item.freeze);
  const tabs: PackageActionTab[] = [];
  if (freeze.canFreeze || freeze.canUnfreeze) {
    tabs.push("freeze");
  }
  if (params.allowEditValidity && canAdjustClientPackageSessions(params.item)) {
    tabs.push("add");
  }
  if (
    params.allowEditValidity &&
    normalizeUserPackageStatus(params.item.status) === "ACTIVE"
  ) {
    tabs.push("attach");
  }
  return tabs;
}

export function AdminClientPackageActions({
  clientId,
  item,
  locale,
  allowEditValidity,
  onSuccess,
}: AdminClientPackageActionsProps) {
  const t = useTranslations("adminPages.clients.packages");
  const tabs = visiblePackageActionTabs({ item, allowEditValidity });
  const [activeId, setActiveId] = useState("");

  if (tabs.length === 0) {
    return null;
  }

  const items = tabs.map((id) => ({
    id,
    label:
      id === "freeze"
        ? t("freezeTab")
        : id === "add"
          ? t("addSessionsTab")
          : t("attachPastTab"),
  }));

  return (
    <div className="space-y-3">
      <AdminPillTabs
        items={items}
        activeId={activeId}
        onChange={(id) => setActiveId(id === activeId ? "" : id)}
        ariaLabel={t("actionTabsAria")}
      />
      {activeId === "freeze" ? (
        <AdminClientPackageFreezeControls item={item} onSuccess={onSuccess} />
      ) : null}
      {activeId === "add" ? (
        <AdminClientPackageSessionsAdjuster item={item} onSuccess={onSuccess} />
      ) : null}
      {activeId === "attach" ? (
        <AdminClientPackagePastSessionControls
          clientId={clientId}
          item={item}
          locale={locale}
          active
          onSuccess={onSuccess}
        />
      ) : null}
    </div>
  );
}
