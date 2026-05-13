"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmButton } from "@/components/ui/omm-button";

type AdminClientActionsProps = {
  clientId: string;
  initialEmail: string;
  initialName: string;
  initialLastName: string;
  initialPhone: string;
};

type FormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
};

type FormErrors = {
  email?: string;
};

const EDIT_CLIENT_QUERY_KEY = "editClient";

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

export function AdminClientActions({
  clientId,
  initialEmail,
  initialName,
  initialLastName,
  initialPhone,
}: AdminClientActionsProps) {
  const t = useTranslations("adminPages.clients");
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
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const isOpen = searchParams.get(EDIT_CLIENT_QUERY_KEY) === clientId;

  const resetForm = useCallback(() => {
    setForm({
      email: initialEmail,
      name: initialName,
      lastName: initialLastName,
      phone: initialPhone,
    });
    setErrors({});
  }, [initialEmail, initialLastName, initialName, initialPhone]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "email") {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }

  function openModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_CLIENT_QUERY_KEY, clientId);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setInlineMessage(null);
    setNote("");
    resetForm();
  }

  const closeModal = useCallback(() => {
    if (busy) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_CLIENT_QUERY_KEY);
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

  async function run(
    action: () => Promise<void>,
    okLabel: string,
    options?: { closeOnSuccess?: boolean },
  ) {
    if (busy) {
      return;
    }
    setBusy(true);
    setInlineMessage(null);
    try {
      await action();
      setTone("ok");
      setInlineMessage(okLabel);
      if (options?.closeOnSuccess) {
        closeModal();
      }
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
    if (email === "") {
      setErrors({ email: t("emailRequired") });
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrors({ email: t("emailInvalid") });
      return;
    }

    await run(
      () =>
        apiFetch(`/clients/${clientId}`, {
          method: "PATCH",
          body: JSON.stringify({
            email,
            name: form.name.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
          }),
        }),
      t("updateSuccess"),
      { closeOnSuccess: true },
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 active:scale-95 active:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50"
          aria-label={t("editClient")}
          title={t("editClient")}
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
                <label className="text-sm font-medium text-sage-700" htmlFor={`email-${clientId}`}>
                  {t("fieldEmail")}
                </label>
                <input
                  id={`email-${clientId}`}
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
                    htmlFor={`name-${clientId}`}
                  >
                    {t("fieldName")}
                  </label>
                  <input
                    id={`name-${clientId}`}
                    type="text"
                    autoComplete="given-name"
                    className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-sage-700"
                    htmlFor={`last-name-${clientId}`}
                  >
                    {t("fieldLastName")}
                  </label>
                  <input
                    id={`last-name-${clientId}`}
                    type="text"
                    autoComplete="family-name"
                    className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-sage-700" htmlFor={`phone-${clientId}`}>
                  {t("fieldPhone")}
                </label>
                <input
                  id={`phone-${clientId}`}
                  type="tel"
                  autoComplete="tel"
                  className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  disabled={busy}
                />
              </div>

              <div className="border-t border-white/70 pt-4">
                <label
                  className="mb-1 block text-sm font-medium text-sage-700"
                  htmlFor={`note-${clientId}`}
                >
                  {t("noteLabel")}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id={`note-${clientId}`}
                    type="text"
                    className="app-input h-10 text-sm"
                    placeholder={t("notePlaceholder")}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={busy}
                  />
                  <OmmButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 rounded-xl px-4 text-xs"
                    disabled={busy || note.trim() === ""}
                    onClick={() =>
                      void run(
                        () =>
                          apiFetch(`/clients/${clientId}/notes`, {
                            method: "POST",
                            body: JSON.stringify({ body: note.trim() }),
                          }),
                        t("noteAddedSuccess"),
                      )
                    }
                  >
                    {t("addNote")}
                  </OmmButton>
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
