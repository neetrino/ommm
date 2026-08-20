"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isValidEmail,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
} from "@/components/admin/admin-coach-form-helpers";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { ApiError, apiFetch } from "@/lib/api";
import { isLatinPersonName } from "@/lib/latin-person-name";
import { isValidPhone, normalizePhoneForApi } from "@/lib/phone";
import {
  PSEUDO_EMAIL,
  PSEUDO_FIRST_NAME,
  PSEUDO_LAST_NAME,
  PSEUDO_PHONE,
} from "@/lib/pseudo-form-placeholders";

type CreateManagerApiResponse = {
  manager: { id: string };
  invite: { welcomeEmailSent: boolean };
};

type AdminCreateManagerFormProps = {
  onCreated: (welcomeEmailSent: boolean) => void;
  onCancel?: () => void;
};

export function AdminCreateManagerForm({
  onCreated,
  onCancel,
}: AdminCreateManagerFormProps) {
  const t = useTranslations("adminPages.managers.create");
  const tPage = useTranslations("adminPages.managers");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [phone, setPhone] = useState("");
  const submitLockRef = useRef(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const form = event.currentTarget;
    const fd = new FormData(form);
    const nameRaw = String(fd.get("name") ?? "").trim();
    const lastNameRaw = String(fd.get("lastName") ?? "").trim();
    const emailRaw = String(fd.get("email") ?? "").trim();
    const phoneRaw = phone.trim();
    const validationError = validateCreateManagerFields({
      nameRaw,
      lastNameRaw,
      emailRaw,
      phoneRaw,
      t,
    });
    setError(validationError);
    if (validationError !== null) {
      return;
    }
    submitLockRef.current = true;
    setPending(true);
    try {
      const response = await apiFetch<CreateManagerApiResponse>("/managers", {
        method: "POST",
        body: JSON.stringify({
          email: emailRaw.toLowerCase(),
          name: nameRaw,
          lastName: lastNameRaw,
          phone: normalizePhoneForApi(phoneRaw),
        }),
      });
      onCreated(response.invite.welcomeEmailSent);
    } catch (err) {
      setError(resolveCreateError(err, t("genericError")));
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
              {t("sectionPersonal")}
            </h3>
            <p className="mt-1 text-xs text-sage-500">{t("sectionPersonalLead")}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("nameLabel")}</span>
              <input
                name="name"
                className="ommm-input"
                autoComplete="given-name"
                maxLength={MAX_NAME_LENGTH}
                placeholder={PSEUDO_FIRST_NAME}
                required
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("lastNameLabel")}</span>
              <input
                name="lastName"
                className="ommm-input"
                autoComplete="family-name"
                maxLength={MAX_NAME_LENGTH}
                placeholder={PSEUDO_LAST_NAME}
                required
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1 lg:col-span-2">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("emailLabel")}</span>
              <input
                name="email"
                type="email"
                className="ommm-input"
                autoComplete="email"
                maxLength={MAX_EMAIL_LENGTH}
                placeholder={PSEUDO_EMAIL}
                required
                disabled={pending}
              />
              <span className="text-xs text-sage-500">{t("emailHint")}</span>
            </label>
            <label className="flex flex-col gap-1 lg:col-span-2">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("phoneLabel")}</span>
              <PhoneInputField
                name="phone"
                className="ommm-input"
                value={phone}
                onValueChange={setPhone}
                placeholder={PSEUDO_PHONE}
                required
                disabled={pending}
              />
            </label>
          </div>
        </section>
      </div>
      {error !== null ? <FormErrorBanner message={error} /> : null}
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/85 px-5 py-4 backdrop-blur-sm sm:rounded-b-[28px] sm:px-7">
        {onCancel !== undefined ? (
          <OmmButton type="button" variant="secondary" size="md" disabled={pending} onClick={onCancel}>
            {tPage("cancelButton")}
          </OmmButton>
        ) : null}
        <OmmButton type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </OmmButton>
      </div>
    </form>
  );
}

function validateCreateManagerFields(params: {
  nameRaw: string;
  lastNameRaw: string;
  emailRaw: string;
  phoneRaw: string;
  t: (key: string) => string;
}): string | null {
  if (params.nameRaw.length === 0) {
    return params.t("nameRequired");
  }
  if (!isLatinPersonName(params.nameRaw)) {
    return params.t("nameLatinOnly");
  }
  if (params.lastNameRaw.length === 0) {
    return params.t("lastNameRequired");
  }
  if (!isLatinPersonName(params.lastNameRaw)) {
    return params.t("lastNameLatinOnly");
  }
  if (!isValidEmail(params.emailRaw)) {
    return params.t("emailInvalid");
  }
  if (params.phoneRaw.length === 0) {
    return params.t("phoneRequired");
  }
  if (!isValidPhone(params.phoneRaw)) {
    return params.t("phoneInvalid");
  }
  return null;
}

function resolveCreateError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }
  return fallback;
}
