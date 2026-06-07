"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_ACTION_ICON_CLASS,
  PencilGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

type ContentPostRowActionsProps = {
  busy: boolean;
  onEdit: () => void;
};

export function ContentPostRowActions({ busy, onEdit }: ContentPostRowActionsProps) {
  const t = useTranslations("contentAdminPages.content");

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-1.5"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="group"
      aria-label={t("colActions")}
    >
      <AdminRowIconButton
        ariaLabel={t("editPost")}
        title={t("editPost")}
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
