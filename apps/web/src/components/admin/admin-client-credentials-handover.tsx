"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";

const COPY_FEEDBACK_MS = 2400;

type AdminClientCredentialsHandoverProps = {
  email: string;
  temporaryPassword: string | null;
  passwordResetUrl: string | null;
  welcomeEmailSent: boolean;
  onDone: () => void;
};

export function AdminClientCredentialsHandover({
  email,
  temporaryPassword,
  passwordResetUrl,
  welcomeEmailSent,
  onDone,
}: AdminClientCredentialsHandoverProps) {
  const t = useTranslations("adminPages.clients.create");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const credentialText = [
    `${t("credentialsEmailLabel")}: ${email}`,
    temporaryPassword !== null
      ? `${t("credentialsPasswordLabel")}: ${temporaryPassword}`
      : null,
    passwordResetUrl !== null
      ? `${t("credentialsResetLabel")}: ${passwordResetUrl}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const onCopyCredentials = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(credentialText);
      setCopyFeedback(t("copyCredentialsSuccess"));
      window.setTimeout(() => setCopyFeedback(null), COPY_FEEDBACK_MS);
    } catch {
      setCopyFeedback(t("copyCredentialsFailed"));
      window.setTimeout(() => setCopyFeedback(null), COPY_FEEDBACK_MS);
    }
  }, [credentialText, t]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[24px] border border-mint-200/80 bg-mint-50/90 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-sage-900">{t("successTitle")}</h3>
        <p className="ommm-body-muted mt-1 text-sm">{t("successLead")}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="ommm-label text-xs uppercase tracking-wide">{t("credentialsEmailLabel")}</dt>
            <dd className="mt-1 font-medium text-sage-900">{email}</dd>
          </div>
          {temporaryPassword !== null ? (
            <div>
              <dt className="ommm-label text-xs uppercase tracking-wide">
                {t("credentialsPasswordLabel")}
              </dt>
              <dd className="mt-1 font-mono text-sm font-medium text-sage-900">
                {temporaryPassword}
              </dd>
            </div>
          ) : null}
          {passwordResetUrl !== null ? (
            <div>
              <dt className="ommm-label text-xs uppercase tracking-wide">
                {t("credentialsResetLabel")}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-sage-800">
                {passwordResetUrl}
              </dd>
              <p className="mt-1 text-xs text-sage-600">{t("forceResetHandoverHint")}</p>
            </div>
          ) : null}
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <OmmButton type="button" variant="primary" size="md" onClick={() => void onCopyCredentials()}>
            {t("copyCredentials")}
          </OmmButton>
          {copyFeedback ? (
            <p className="text-sm text-sage-600" role="status">
              {copyFeedback}
            </p>
          ) : null}
        </div>
        {welcomeEmailSent ? (
          <p className="mt-3 text-xs text-sage-600">{t("welcomeEmailSent")}</p>
        ) : null}
      </div>
      <div className="flex justify-end">
        <OmmButton type="button" variant="secondary" size="md" onClick={onDone}>
          {t("doneButton")}
        </OmmButton>
      </div>
    </div>
  );
}
