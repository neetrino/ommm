'use client';

import { useTranslations } from 'next-intl';
import { useAdminWhatsappGatewayStatus } from '@/components/admin/use-admin-whatsapp-gateway-status';

type AdminWhatsappGatewayStatusProps = {
  enabled: boolean;
  refreshKey: number;
};

export function AdminWhatsappGatewayStatus({
  enabled,
  refreshKey,
}: AdminWhatsappGatewayStatusProps) {
  const t = useTranslations('adminPages.settings.whatsapp');
  const { reachable, checking } = useAdminWhatsappGatewayStatus(enabled, refreshKey);
  const ok = enabled && reachable && !checking;
  const label = !enabled
    ? t('gatewayStatusFail')
    : checking
      ? t('gatewayStatusChecking')
      : reachable
        ? t('gatewayStatusOk')
        : t('gatewayStatusFail');

  return (
    <p
      className="flex flex-wrap items-center gap-2 text-sm text-sage-800"
      role="status"
      aria-live="polite"
    >
      <span>{t('gatewayStatusLabel')}</span>
      <span
        className={
          ok
            ? 'inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-2.5 py-1 text-xs font-medium text-sage-800'
            : 'inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800'
        }
      >
        <span
          className={
            ok
              ? 'h-2 w-2 shrink-0 rounded-full bg-emerald-600'
              : 'h-2 w-2 shrink-0 rounded-full bg-red-600'
          }
          aria-hidden
        />
        {label}
      </span>
    </p>
  );
}
