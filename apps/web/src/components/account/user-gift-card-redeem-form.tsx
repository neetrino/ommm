"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { memberChrome } from "@/components/account/member-chrome";
import { OmmButton } from "@/components/ui/omm-button";
import { FormErrorBanner, formFieldInputClass } from "@/components/ui/form-validation";
import { ApiError, apiFetch } from "@/lib/api";

const GIFT_CODE_MIN_LENGTH = 4;

type RedeemResponse = {
  ok: true;
  alreadyOwned: boolean;
};

const SUCCESS_CLASS =
  "rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800";

/** Member enters a gift code. The balance stays on the card until this succeeds. */
export function UserGiftCardRedeemForm() {
  const t = useTranslations("userPages.giftCards.redeemForm");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <RedeemFormView
      eyebrow={t("eyebrow")}
      title={t("title")}
      lead={t("lead")}
      codeLabel={t("codeLabel")}
      codePlaceholder={t("codePlaceholder")}
      submitLabel={busy ? t("submitting") : t("submit")}
      code={code}
      error={error}
      success={success}
      busy={busy}
      onCodeChange={(value) => {
        setCode(value);
        setError(null);
      }}
      onSubmit={(event) => {
        void submitRedeem(event, {
          code,
          busy,
          failed: t("failed"),
          invalidCode: t("invalidCode"),
          success: t("success"),
          setCode,
          setError,
          setSuccess,
          setBusy,
          refresh: () => router.refresh(),
        });
      }}
    />
  );
}

type RedeemFormViewProps = {
  eyebrow: string;
  title: string;
  lead: string;
  codeLabel: string;
  codePlaceholder: string;
  submitLabel: string;
  code: string;
  error: string | null;
  success: string | null;
  busy: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

function RedeemFormView(props: RedeemFormViewProps) {
  return (
    <form
      className={`${memberChrome.surface} ${memberChrome.surfacePad} flex flex-col gap-4`}
      onSubmit={props.onSubmit}
    >
      <div>
        <p className={memberChrome.cardMeta}>{props.eyebrow}</p>
        <h2 className="mt-2 font-serif text-[1.65rem] font-normal leading-none tracking-tight text-sage-900">
          {props.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-sage-600">{props.lead}</p>
      </div>
      <label className="flex flex-col gap-1" htmlFor="gift-card-code">
        <span className="ommm-label text-xs uppercase tracking-wide">{props.codeLabel}</span>
        <input
          id="gift-card-code"
          name="code"
          value={props.code}
          autoComplete="off"
          spellCheck={false}
          placeholder={props.codePlaceholder}
          disabled={props.busy}
          aria-invalid={props.error !== null}
          className={formFieldInputClass(props.error !== null, "font-mono tracking-[0.12em]")}
          onChange={(event) => props.onCodeChange(event.target.value)}
        />
      </label>
      <FormErrorBanner message={props.error} variant="inline" />
      {props.success !== null ? (
        <p className={SUCCESS_CLASS} role="status">
          {props.success}
        </p>
      ) : null}
      <div className="flex justify-end">
        <OmmButton type="submit" variant="primary" disabled={props.busy || props.code.trim().length === 0}>
          {props.submitLabel}
        </OmmButton>
      </div>
    </form>
  );
}

async function submitRedeem(
  event: FormEvent,
  input: {
    code: string;
    busy: boolean;
    failed: string;
    invalidCode: string;
    success: string;
    setCode: (value: string) => void;
    setError: (value: string | null) => void;
    setSuccess: (value: string | null) => void;
    setBusy: (value: boolean) => void;
    refresh: () => void;
  },
): Promise<void> {
  event.preventDefault();
  const trimmed = input.code.trim();
  if (trimmed.length === 0 || input.busy) {
    return;
  }
  if (trimmed.length < GIFT_CODE_MIN_LENGTH) {
    input.setError(input.invalidCode);
    return;
  }
  input.setBusy(true);
  input.setError(null);
  input.setSuccess(null);
  try {
    await apiFetch<RedeemResponse>("/gift-cards/redeem", {
      method: "POST",
      body: JSON.stringify({ code: trimmed }),
    });
    input.setCode("");
    input.setSuccess(input.success);
    input.refresh();
  } catch (caught) {
    input.setError(redeemErrorText(caught, input.failed, input.invalidCode));
  } finally {
    input.setBusy(false);
  }
}

function redeemErrorText(caught: unknown, failed: string, invalidCode: string): string {
  const message = caught instanceof ApiError ? caught.message : failed;
  if (message.toLowerCase().includes("longer than or equal to")) {
    return invalidCode;
  }
  return message;
}
