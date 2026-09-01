'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { adminChrome } from '@/components/admin/admin-chrome';
import { OmmButton } from '@/components/ui/omm-button';
import { ApiError, apiFetch } from '@/lib/api';

type AdminWhatsappTestMessagePanelProps = {
  enabled: boolean;
};

export function AdminWhatsappTestMessagePanel({ enabled }: AdminWhatsappTestMessagePanelProps) {
  const t = useTranslations('adminPages.settings.whatsapp');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function send(): Promise<void> {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch('/whatsapp/admin/test-message', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim() }),
      });
      setOk(true);
      setMsg(t('testMessageSent'));
    } catch (caught) {
      setOk(false);
      setMsg(caught instanceof ApiError ? caught.message : t('testMessageFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${adminChrome.panel} relative isolate z-0 flex flex-col gap-4`}>
      <div>
        <h2 className={adminChrome.panelHeading}>{t('testMessageTitle')}</h2>
        <p className="ommm-body-muted mt-1 text-sm">{t('testMessageHint')}</p>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-sage-800">{t('testPhoneLabel')}</span>
        <input
          className="ommm-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t('testPhonePlaceholder')}
          value={phone}
          disabled={!enabled || busy}
          onChange={(event) => setPhone(event.target.value)}
        />
        <span className="ommm-body-muted text-xs">{t('testPhoneExample')}</span>
      </label>
      {msg ? (
        <p
          className={ok ? 'text-sm font-medium text-sage-800' : 'text-sm font-medium text-red-700'}
          role="status"
        >
          {msg}
        </p>
      ) : null}
      <div>
        <OmmButton
          type="button"
          disabled={!enabled || busy || phone.trim().length === 0}
          onClick={() => {
            void send();
          }}
        >
          {busy ? t('sendingTestMessage') : t('sendTestMessage')}
        </OmmButton>
      </div>
    </section>
  );
}
