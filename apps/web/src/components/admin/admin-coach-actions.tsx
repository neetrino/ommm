"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCoachActionsProps = {
  coachId: string;
  initialEmail?: string;
  initialName?: string;
  initialLastName?: string;
  initialPhone?: string;
  initialAge?: number | null;
  initialSpecialization?: string;
  initialBio?: string;
};

type FormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  age: string;
};

type FormErrors = {
  email?: string;
  name?: string;
  lastName?: string;
  phone?: string;
  age?: string;
};

const EDIT_COACH_QUERY_KEY = "editCoach";
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;
const COACH_MIN_AGE = 16;
const COACH_MAX_AGE = 100;

function PencilGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function AdminCoachActions({
  coachId,
  initialEmail = "",
  initialName = "",
  initialLastName = "",
  initialPhone = "",
  initialAge = null,
}: AdminCoachActionsProps) {
  const t = useTranslations("adminPages.coaches");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>({
    email: initialEmail,
    name: initialName,
    lastName: initialLastName,
    phone: initialPhone,
    age: initialAge === null ? "" : String(initialAge),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const isOpen = searchParams.get(EDIT_COACH_QUERY_KEY) === coachId;

  const resetForm = useCallback(() => {
    setForm({
      email: initialEmail,
      name: initialName,
      lastName: initialLastName,
      phone: initialPhone,
      age: initialAge === null ? "" : String(initialAge),
    });
    setErrors({});
  }, [initialAge, initialEmail, initialLastName, initialName, initialPhone]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function openModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_COACH_QUERY_KEY, coachId);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setInlineMessage(null);
    resetForm();
  }

  const closeModal = useCallback(() => {
    if (busy) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_COACH_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setErrors({});
  }, [busy, pathname, router, searchParams]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [closeModal, isOpen]);

  useEffect(() => {
    if (!isOpen || panelRef.current === null) {
      return;
    }
    const input = panelRef.current.querySelector<HTMLInputElement>(
      'input[name="email"]',
    );
    input?.focus();
  }, [isOpen]);

  async function run(action: () => Promise<void>, okLabel: string) {
    if (busy) {
      return;
    }
    setBusy(true);
    setInlineMessage(null);
    try {
      await action();
      setTone("ok");
      setInlineMessage(okLabel);
      closeModal();
      router.refresh();
    } catch (error) {
      setTone("err");
      setInlineMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    const email = form.email.trim().toLowerCase();
    const name = form.name.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();
    const age = Number(form.age.trim());
    const nextErrors: FormErrors = {};
    if (email === "") {
      nextErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t("emailInvalid");
    }
    if (name.length === 0) {
      nextErrors.name = t("nameRequired");
    }
    if (lastName.length === 0) {
      nextErrors.lastName = t("lastNameRequired");
    }
    const phoneDigits = phone.replace(/\D/g, "").length;
    if (phone.length === 0) {
      nextErrors.phone = t("phoneRequired");
    } else if (phoneDigits < MIN_PHONE_DIGITS || phoneDigits > MAX_PHONE_DIGITS) {
      nextErrors.phone = t("phoneInvalid");
    }
    if (
      form.age.trim().length === 0 ||
      !Number.isInteger(age) ||
      age < COACH_MIN_AGE ||
      age > COACH_MAX_AGE
    ) {
      nextErrors.age = t("ageInvalid", { min: COACH_MIN_AGE, max: COACH_MAX_AGE });
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await run(
      () =>
        apiFetch(`/coaches/${coachId}`, {
          method: "PATCH",
          body: JSON.stringify({
            email,
            name,
            lastName,
            phone,
            age,
          }),
        }),
      t("updateSuccess"),
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 active:scale-95 active:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50"
          aria-label={t("editCoach")}
          title={t("editCoach")}
          onClick={openModal}
        >
          <PencilGlyph className="h-4 w-4" />
        </button>
      </div>

      {inlineMessage ? (
        <div
          role="status"
          className={`fixed bottom-4 right-4 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
            tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {inlineMessage}
        </div>
      ) : null}

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4"
              role="presentation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-sage-950/45 backdrop-blur-[2px] transition-opacity"
                aria-label={t("modalBackdropClose")}
                onClick={closeModal}
              />
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
                className="relative mt-auto max-h-[min(92vh,760px)] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id={titleId} className={adminChrome.panelHeading}>
                      {t("editModalTitle")}
                    </h2>
                    <p id={descId} className="ommm-body-muted mt-1 text-sm">
                      {t("editModalDescription")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    aria-label={t("modalCloseAria")}
                    onClick={closeModal}
                    disabled={busy}
                  >
                    <CloseGlyph className="h-5 w-5" />
                  </button>
                </div>

                <form
                  className="mt-5 flex flex-col gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onSave();
                  }}
                >
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-sage-700" htmlFor={`email-${coachId}`}>
                      {t("fieldEmail")}
                    </label>
                    <input
                      id={`email-${coachId}`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      disabled={busy}
                    />
                    {errors.email ? <p className="text-xs text-red-800">{errors.email}</p> : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        className="text-sm font-medium text-sage-700"
                        htmlFor={`name-${coachId}`}
                      >
                        {t("fieldName")}
                      </label>
                      <input
                        id={`name-${coachId}`}
                        type="text"
                        autoComplete="given-name"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        disabled={busy}
                      />
                      {errors.name ? <p className="text-xs text-red-800">{errors.name}</p> : null}
                    </div>
                    <div className="space-y-1">
                      <label
                        className="text-sm font-medium text-sage-700"
                        htmlFor={`last-name-${coachId}`}
                      >
                        {t("fieldLastName")}
                      </label>
                      <input
                        id={`last-name-${coachId}`}
                        type="text"
                        autoComplete="family-name"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.lastName}
                        onChange={(event) => updateField("lastName", event.target.value)}
                        disabled={busy}
                      />
                      {errors.lastName ? (
                        <p className="text-xs text-red-800">{errors.lastName}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-sage-700" htmlFor={`phone-${coachId}`}>
                        {t("fieldPhone")}
                      </label>
                      <input
                        id={`phone-${coachId}`}
                        type="tel"
                        autoComplete="tel"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        disabled={busy}
                      />
                      {errors.phone ? <p className="text-xs text-red-800">{errors.phone}</p> : null}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-sage-700" htmlFor={`age-${coachId}`}>
                        {t("fieldAge")}
                      </label>
                      <input
                        id={`age-${coachId}`}
                        type="number"
                        min={COACH_MIN_AGE}
                        max={COACH_MAX_AGE}
                        inputMode="numeric"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.age}
                        onChange={(event) => updateField("age", event.target.value)}
                        disabled={busy}
                      />
                      {errors.age ? <p className="text-xs text-red-800">{errors.age}</p> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    <OmmButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-xl px-4 text-xs"
                      onClick={closeModal}
                      disabled={busy}
                    >
                      {t("cancelButton")}
                    </OmmButton>
                    <OmmButton
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="h-10 rounded-xl px-5 text-xs"
                      disabled={busy}
                    >
                      {busy ? t("savingButton") : t("saveButton")}
                    </OmmButton>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
