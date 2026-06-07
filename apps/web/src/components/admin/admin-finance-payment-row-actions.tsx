"use client";

import { useTranslations } from "next-intl";
import { ADMIN_ACTION_ICON_CLASS, PencilGlyph } from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

type AdminFinancePaymentRowActionsProps = {
  busy: boolean;
  onEdit: () => void;
};

export function AdminFinancePaymentRowActions({
  busy,
  onEdit,
}: AdminFinancePaymentRowActionsProps) {
  const t = useTranslations("adminPages.finance.table");

  return (
    <div
      className="flex items-center justify-end gap-1"
      role="group"
      aria-label={t("colActions")}
    >
      <AdminRowIconButton
        ariaLabel={t("actionEditPayment")}
        title={t("actionEditPayment")}
        variant="subtle"
        disabled={busy}
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
      >
        <PencilGlyph className={ADMIN_ACTION_ICON_CLASS} />
      </AdminRowIconButton>
    </div>
  );
}
