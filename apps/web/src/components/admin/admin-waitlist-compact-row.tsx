"use client";

import { WaitlistCardFields } from "@/components/admin/admin-waitlist-compact-row-fields";
import { ADMIN_WAITLIST_LIST_ROW_CLASS } from "@/components/admin/admin-waitlist-list-layout";
import type { AdminWaitlistRow } from "@/components/admin/admin-waitlist-query";

type AdminWaitlistCompactRowProps = {
  locale: string;
  row: AdminWaitlistRow;
  rowBusy: boolean;
  userLabel: string;
  onOpenUser: (userId: string) => void;
  onPromote: () => void;
  onNotify: () => void;
  onRemove: () => void;
};

export function AdminWaitlistCompactRow({
  locale,
  row,
  rowBusy,
  userLabel,
  onOpenUser,
  onPromote,
  onNotify,
  onRemove,
}: AdminWaitlistCompactRowProps) {
  return (
    <article className={ADMIN_WAITLIST_LIST_ROW_CLASS}>
      <WaitlistCardFields
        locale={locale}
        row={row}
        rowBusy={rowBusy}
        userLabel={userLabel}
        onOpenUser={onOpenUser}
        onPromote={onPromote}
        onNotify={onNotify}
        onRemove={onRemove}
      />
    </article>
  );
}
