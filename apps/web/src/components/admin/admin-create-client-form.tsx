"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isValidEmail,
  isValidPhone,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
} from "@/components/admin/admin-coach-form-helpers";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import {
  ADMIN_CREATE_FORM_ACTIONS_CLASS,
  ADMIN_CREATE_FORM_BODY_CLASS,
  ADMIN_CREATE_FORM_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { ApiError, apiFetch } from "@/lib/api";
import { isLatinPersonName } from "@/lib/latin-person-name";
import { normalizePhoneForApi } from "@/lib/phone";
import {
  PSEUDO_BIRTHDAY,
  PSEUDO_EMAIL,
  PSEUDO_FIRST_NAME,
  PSEUDO_LAST_NAME,
  PSEUDO_PHONE,
} from "@/lib/pseudo-form-placeholders";

type CreateClientApiResponse = {
  client: ClientRow;
  invite: {
    email: string;
    passwordSetupUrl: string;
    welcomeEmailSent: boolean;
  };
};

export type AdminCreateClientResult = {
  client: ClientRow;
  welcomeEmailSent: boolean;
};

export type AdminCreateClientFormProps = {
  onCreated: (result: AdminCreateClientResult) => void;
  onCancel?: () => void;
};

export function AdminCreateClientForm({ onCreated, onCancel }: AdminCreateClientFormProps) {
  const t = useTranslations("adminPages.clients.create");
  const tPage = useTranslations("adminPages.clients");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [phone, setPhone] = useState("");
  const [birthdayValue, setBirthdayValue] = useState("");
  const submitLockRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const nameRaw = String(fd.get("name") ?? "").trim();
    const lastNameRaw = String(fd.get("lastName") ?? "").trim();
    const emailRaw = String(fd.get("email") ?? "").trim();
    const phoneRaw = phone.trim();

    setError(null);

    if (nameRaw.length === 0) {
      setError(t("nameRequired"));
      return;
    }
    if (!isLatinPersonName(nameRaw)) {
      setError(t("nameLatinOnly"));
      return;
    }
    if (lastNameRaw.length === 0) {
      setError(t("lastNameRequired"));
      return;
    }
    if (!isLatinPersonName(lastNameRaw)) {
      setError(t("lastNameLatinOnly"));
      return;
    }
    if (!isValidEmail(emailRaw)) {
      setError(t("emailInvalid"));
      return;
    }
    if (phoneRaw.length === 0) {
      setError(t("phoneRequired"));
      return;
    }
    if (!isValidPhone(phoneRaw)) {
      setError(t("phoneInvalid"));
      return;
    }
    if (birthdayValue.trim().length > 0 && Number.isNaN(Date.parse(birthdayValue))) {
      setError(t("birthdayInvalid"));
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      const response = await apiFetch<CreateClientApiResponse>("/clients", {
        method: "POST",
        body: JSON.stringify({
          email: emailRaw.toLowerCase(),
          name: nameRaw,
          lastName: lastNameRaw,
          phone: normalizePhoneForApi(phoneRaw),
          ...(birthdayValue.trim().length > 0 ? { dateOfBirth: birthdayValue.trim() } : {}),
        }),
      });
      onCreated({
        client: response.client,
        welcomeEmailSent: response.invite.welcomeEmailSent,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError(t("genericError"));
      }
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className={ADMIN_CREATE_FORM_CLASS}
    >
      <div className={ADMIN_CREATE_FORM_BODY_CLASS}>
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
            <label className="flex flex-col gap-1">
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
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("birthdayLabel")}</span>
              <DatePickerInput
                name="birthday"
                value={birthdayValue}
                onChange={setBirthdayValue}
                ariaLabel={t("birthdayLabel")}
                placeholder={PSEUDO_BIRTHDAY}
                allowManualEntry
                disabled={pending}
              />
              <span className="text-xs text-sage-500">{t("birthdayOptionalHint")}</span>
            </label>
          </div>
        </section>

        {error !== null ? <FormErrorBanner message={error} /> : null}

        <div className={ADMIN_CREATE_FORM_ACTIONS_CLASS}>
          {onCancel !== undefined ? (
            <OmmButton type="button" variant="secondary" size="md" disabled={pending} onClick={onCancel}>
              {tPage("cancelButton")}
            </OmmButton>
          ) : null}
          <OmmButton type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t("submitting") : t("submit")}
          </OmmButton>
        </div>
      </div>
    </form>
  );
}
