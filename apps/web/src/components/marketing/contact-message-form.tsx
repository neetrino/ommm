"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import {
  CONTACT_PAGE_CARD_SHELL_CLASS,
  CONTACT_PAGE_LAYOUT,
  CONTACT_PAGE_SURFACE,
} from "@/components/marketing/contact/contact-page-tokens";
import styles from "@/components/marketing/contact/marketing-contact-message-form.module.css";
import { MarketingContactSuccessToast } from "@/components/marketing/contact/marketing-contact-success-toast";
import { ApiError, apiFetch } from "@/lib/api";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { syncPhoneInputElement } from "@/lib/phone-input";

const CONTACT_REQUIRED_FIELDS = ["name", "phone", "email", "subject", "message"] as const;

type ContactRequiredField = (typeof CONTACT_REQUIRED_FIELDS)[number];

function getEmptyContactFields(form: HTMLFormElement): ContactRequiredField[] {
  const formData = new FormData(form);
  return CONTACT_REQUIRED_FIELDS.filter(
    (field) => String(formData.get(field) ?? "").trim().length === 0,
  );
}

function fieldInputClass(
  field: ContactRequiredField,
  invalidFields: ReadonlySet<ContactRequiredField>,
  baseClass: string,
): string {
  return invalidFields.has(field) ? `${baseClass} ${styles.inputInvalid}` : baseClass;
}

const FORM_STYLE = {
  "--contact-card-padding": `${CONTACT_PAGE_LAYOUT.cardPaddingPx}px`,
  "--contact-input-radius": `${CONTACT_PAGE_LAYOUT.inputRadiusPx}px`,
  "--contact-input-bg": CONTACT_PAGE_SURFACE.inputBackground,
  "--contact-input-border": CONTACT_PAGE_SURFACE.inputBorder,
  "--contact-input-error-border": CONTACT_PAGE_SURFACE.inputErrorBorder,
  "--contact-input-error-ring": CONTACT_PAGE_SURFACE.inputErrorRing,
  "--contact-button-radius": `${CONTACT_PAGE_LAYOUT.buttonRadiusPx}px`,
  "--contact-button-bg": CONTACT_PAGE_SURFACE.buttonBackground,
  "--contact-button-hover-bg": CONTACT_PAGE_SURFACE.buttonHoverBackground,
  "--contact-heading-color": CONTACT_PAGE_SURFACE.headingColor,
  "--contact-label-color": CONTACT_PAGE_SURFACE.labelColor,
  "--contact-value-color": CONTACT_PAGE_SURFACE.valueColor,
  "--contact-security-color": CONTACT_PAGE_SURFACE.securityTextColor,
} as CSSProperties;

function ContactLockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.securityIcon}
      aria-hidden
    >
      <rect
        x="2.5"
        y="6"
        width="9"
        height="6.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M4.5 6V4.75C4.5 3.231 5.731 2 7.25 2H6.75C8.269 2 9.5 3.231 9.5 4.75V6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ContactMessagePrefill = {
  name: string;
  email: string;
  phone: string;
};

type ContactMessageFormProps = {
  formTitle?: string;
  prefill?: ContactMessagePrefill;
};

export function ContactMessageForm({ formTitle, prefill }: ContactMessageFormProps) {
  const t = useTranslations("forms.contact");
  const tPage = useTranslations("marketingPages.contact");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [invalidFields, setInvalidFields] = useState<ReadonlySet<ContactRequiredField>>(
    () => new Set(),
  );

  function clearInvalidField(field: ContactRequiredField) {
    setInvalidFields((current) => {
      if (!current.has(field)) {
        return current;
      }
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const emptyFields = getEmptyContactFields(formElement);
    if (emptyFields.length > 0) {
      setInvalidFields(new Set(emptyFields));
      setErrorMsg(null);
      setSuccessToast(null);
      const firstField = formElement.elements.namedItem(emptyFields[0]);
      if (firstField instanceof HTMLElement) {
        firstField.focus();
      }
      return;
    }

    setInvalidFields(new Set());
    const form = new FormData(formElement);
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    setErrorMsg(null);
    setSuccessToast(null);
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? "").trim(),
          email,
          phone: String(form.get("phone") ?? "").trim(),
          subject: String(form.get("subject") ?? "").trim() || undefined,
          message,
        }),
      });
      setSuccessToast(t("thankYou"));
      formElement.reset();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : t("sendError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form
        noValidate
        onSubmit={(ev) => void onSubmit(ev)}
        className={`${CONTACT_PAGE_CARD_SHELL_CLASS} ${styles.form}`}
        style={FORM_STYLE}
      >
        <h2 className={styles.heading}>{formTitle ?? tPage("formHeading")}</h2>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.label}>{t("name")}</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder={t("placeholders.name")}
              aria-invalid={invalidFields.has("name")}
              className={fieldInputClass("name", invalidFields, styles.input)}
              defaultValue={prefill?.name}
              onInput={() => clearInvalidField("name")}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t("phone")}</span>
            <input
              name="phone"
              required
              autoComplete="tel"
              placeholder={t("placeholders.phone")}
              aria-invalid={invalidFields.has("phone")}
              className={fieldInputClass("phone", invalidFields, styles.input)}
              defaultValue={prefill?.phone}
              onInput={(event) => {
                syncPhoneInputElement(event.currentTarget);
                clearInvalidField("phone");
              }}
            />
          </label>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("placeholders.email")}
            aria-invalid={invalidFields.has("email")}
            className={fieldInputClass("email", invalidFields, styles.input)}
            defaultValue={prefill?.email}
            onInput={() => clearInvalidField("email")}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("subject")}</span>
          <input
            name="subject"
            required
            autoComplete="off"
            placeholder={t("placeholders.subject")}
            aria-invalid={invalidFields.has("subject")}
            className={fieldInputClass("subject", invalidFields, styles.input)}
            onInput={() => clearInvalidField("subject")}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("message")}</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder={t("placeholders.message")}
            aria-invalid={invalidFields.has("message")}
            className={fieldInputClass("message", invalidFields, styles.textarea)}
            onInput={() => clearInvalidField("message")}
          />
        </label>
        <button type="submit" className={styles.submit} disabled={pending}>
          <span className={styles.submitLabel}>
            {pending ? t("sending") : t("send")}
          </span>
          <Image
            src={CONTACT_PAGE_ASSETS.sendArrow}
            alt=""
            width={20}
            height={18}
            className={styles.submitArrow}
            aria-hidden
            {...belowFoldImageProps()}
          />
        </button>
        <p className={styles.security}>
          <ContactLockIcon />
          {tPage("securityNote")}
        </p>
      </form>
      <MarketingContactSuccessToast
        message={successToast}
        onDismiss={() => setSuccessToast(null)}
      />
      {errorMsg ? (
        <p className={styles.feedbackError} role="status">
          {errorMsg}
        </p>
      ) : null}
    </>
  );
}
