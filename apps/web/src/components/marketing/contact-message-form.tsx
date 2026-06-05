"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import {
  CONTACT_PAGE_LAYOUT,
  CONTACT_PAGE_SURFACE,
} from "@/components/marketing/contact/contact-page-tokens";
import styles from "@/components/marketing/contact/marketing-contact-message-form.module.css";
import { ApiError, apiFetch } from "@/lib/api";

const FORM_STYLE = {
  "--contact-card-bg": CONTACT_PAGE_SURFACE.cardBackground,
  "--contact-card-shadow": CONTACT_PAGE_SURFACE.cardShadow,
  "--contact-card-radius": `${CONTACT_PAGE_LAYOUT.cardRadiusPx}px`,
  "--contact-card-padding": `${CONTACT_PAGE_LAYOUT.cardPaddingPx}px`,
  "--contact-input-radius": `${CONTACT_PAGE_LAYOUT.inputRadiusPx}px`,
  "--contact-input-bg": CONTACT_PAGE_SURFACE.inputBackground,
  "--contact-input-border": CONTACT_PAGE_SURFACE.inputBorder,
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

type ContactMessageFormProps = {
  formTitle?: string;
};

export function ContactMessageForm({ formTitle }: ContactMessageFormProps) {
  const t = useTranslations("forms.contact");
  const tPage = useTranslations("marketingPages.contact");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "");
    const composedMessage =
      email.length > 0 ? `Email: ${email}\n\n${message}` : message;

    setErrorMsg(null);
    setSent(false);
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          subject: form.get("subject") || undefined,
          message: composedMessage,
        }),
      });
      setSent(true);
      e.currentTarget.reset();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : t("sendError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form
        onSubmit={(ev) => void onSubmit(ev)}
        className={styles.form}
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
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t("phone")}</span>
            <input
              name="phone"
              required
              autoComplete="tel"
              className={styles.input}
            />
          </label>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>{t("email")}</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("subject")}</span>
          <input name="subject" autoComplete="off" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("message")}</span>
          <textarea
            name="message"
            required
            rows={5}
            className={styles.textarea}
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
          />
        </button>
        <p className={styles.security}>
          <ContactLockIcon />
          {tPage("securityNote")}
        </p>
      </form>
      {sent ? (
        <p className={styles.feedbackSuccess} role="status">
          {t("thankYou")}
        </p>
      ) : null}
      {errorMsg ? (
        <p className={styles.feedbackError} role="status">
          {errorMsg}
        </p>
      ) : null}
    </>
  );
}
