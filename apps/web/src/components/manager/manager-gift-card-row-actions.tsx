"use client";

import { useRouter } from "@/i18n/navigation";
import { AdminGiftCardActions } from "@/components/admin/admin-gift-card-actions";

type ManagerGiftCardRowActionsProps = {
  giftCardId: string;
  locale: string;
};

export function ManagerGiftCardRowActions({
  giftCardId,
  locale,
}: ManagerGiftCardRowActionsProps) {
  const router = useRouter();
  return (
    <AdminGiftCardActions
      giftCardId={giftCardId}
      allowDeactivate={false}
      allowDelete={false}
      locale={locale}
      assignableUsers={[]}
      onChanged={() => router.refresh()}
    />
  );
}
