"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch, apiFetchFormData } from "@/lib/api";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import type { AdminAssignableUser } from "@/components/admin/admin-gift-cards-types";

type AdminGiftCardFormMode = "create" | "edit";

type AdminCreateGiftCardFormInitialValues = {
  amountAmd: number;
  quantity: number;
  availableQuantity?: number;
  minQuantity?: number;
  recipientEmail: string;
  recipientName: string;
  message: string;
  expiresAt: string;
};

type AdminCreateGiftCardFormProps = {
  users: readonly AdminAssignableUser[];
  onSaved: (createdCount: number) => void;
  onCancel: () => void;
  mode?: AdminGiftCardFormMode;
  batchId?: string;
  initialValues?: AdminCreateGiftCardFormInitialValues;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function AdminCreateGiftCardForm({
  users,
  onSaved,
  onCancel,
  mode = "create",
  batchId,
  initialValues,
}: AdminCreateGiftCardFormProps) {
  const t = useTranslations("adminPages.giftCards");
  const submitLockRef = useRef(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [amountAmd, setAmountAmd] = useState(String(initialValues?.amountAmd ?? 10000));
  const [quantity, setQuantity] = useState(String(initialValues?.quantity ?? 1));
  const minQuantity = initialValues?.minQuantity ?? 1;
  const issuedCount =
    mode === "edit" &&
    initialValues?.availableQuantity !== undefined &&
    Number.isFinite(initialValues.quantity)
      ? initialValues.quantity - initialValues.availableQuantity
      : 0;
  const [showAssignedUser, setShowAssignedUser] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState(initialValues?.recipientEmail ?? "");
  const [recipientName, setRecipientName] = useState(initialValues?.recipientName ?? "");
  const [message, setMessage] = useState(initialValues?.message ?? "");
  const [expiresAt, setExpiresAt] = useState(initialValues?.expiresAt ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const recipientOptions = useMemo<readonly DropdownOption<string>[]>(
    () => [
      { value: "", label: t("fieldAssignedUserPlaceholder") },
      ...users.map((user) => {
        const fullName = [user.name, user.lastName].filter(Boolean).join(" ").trim();
        const label = fullName.length > 0 ? `${fullName} (${user.email})` : user.email;
        return { value: user.id, label };
      }),
    ],
    [t, users],
  );

  const projectedRemaining = useMemo(() => {
    const parsed = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsed) || parsed < minQuantity) {
      return initialValues?.availableQuantity ?? 0;
    }
    if (mode === "edit") {
      return Math.max(0, parsed - issuedCount);
    }
    return parsed;
  }, [quantity, minQuantity, mode, issuedCount, initialValues?.availableQuantity]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl !== null) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || submitLockRef.current) {
      return;
    }
    const parsedAmountAmd = Number.parseInt(amountAmd, 10);
    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsedAmountAmd) || parsedAmountAmd < 1) {
      setTone("err");
      setResult(t("amountInvalid"));
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < minQuantity) {
      setTone("err");
      setResult(
        minQuantity > 1 ? t("quantityBelowIssued", { min: minQuantity }) : t("quantityInvalid"),
      );
      return;
    }
    if (imageFile !== null) {
      if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
        setTone("err");
        setResult(t("imageTypeInvalid"));
        return;
      }
      if (imageFile.size > MAX_IMAGE_BYTES) {
        setTone("err");
        setResult(t("imageTooLarge"));
        return;
      }
    }

    submitLockRef.current = true;
    setBusy(true);
    setResult(null);
    try {
      if (mode === "edit") {
        if (!batchId) {
          throw new Error("Batch id is required for edit mode");
        }
        await apiFetch(`/gift-cards/admin/batches/${batchId}`, {
          method: "PATCH",
          body: JSON.stringify({
            amountAmd: parsedAmountAmd,
            quantity: parsedQuantity,
            recipientId: recipientId.trim().length > 0 ? recipientId.trim() : undefined,
            recipientEmail: recipientEmail.trim().length > 0 ? recipientEmail.trim() : undefined,
            recipientName: recipientName.trim().length > 0 ? recipientName.trim() : undefined,
            message: message.trim().length > 0 ? message.trim() : undefined,
            expiresAt: expiresAt.trim().length > 0 ? expiresAt.trim() : undefined,
          }),
        });
        onSaved(1);
        return;
      }

      const formData = new FormData();
      formData.append("amountAmd", String(parsedAmountAmd));
      formData.append("quantity", String(parsedQuantity));
      if (recipientId.trim().length > 0) {
        formData.append("recipientId", recipientId.trim());
      }
      if (recipientEmail.trim().length > 0) {
        formData.append("recipientEmail", recipientEmail.trim());
      }
      if (recipientName.trim().length > 0) {
        formData.append("recipientName", recipientName.trim());
      }
      if (message.trim().length > 0) {
        formData.append("message", message.trim());
      }
      if (expiresAt.trim().length > 0) {
        formData.append("expiresAt", expiresAt.trim());
      }
      if (imageFile !== null) {
        formData.append("image", imageFile);
      }
      const created = await apiFetchFormData<unknown>("/gift-cards/admin", formData, "POST");
      if (created == null) {
        throw new Error("Gift-card batch creation returned empty response");
      }
      onSaved(parsedQuantity);
    } catch (error) {
      setTone("err");
      setResult(error instanceof ApiError ? error.message : t("genericError"));
      submitLockRef.current = false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldAmount")}</span>
        <input
          name="amountAmd"
          type="number"
          min={1}
          className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder={t("fieldAmountPlaceholder")}
          value={amountAmd}
          onChange={(event) => setAmountAmd(event.target.value)}
          disabled={busy}
          required
        />
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-start gap-3">
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => {
              setShowAssignedUser((current) => {
                const next = !current;
                if (!next) {
                  setRecipientId("");
                  setRecipientEmail("");
                  setRecipientName("");
                }
                return next;
              });
            }}
          >
            Assigne user
          </OmmButton>
        </div>
        {showAssignedUser ? (
          <div className="grid gap-3">
            <DropdownSelect
              label={t("fieldAssignedUserPlaceholder")}
              ariaLabel={t("fieldAssignedUser")}
              value={recipientId}
              options={recipientOptions}
              onChange={setRecipientId}
              disabled={busy}
            />
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldRecipientEmail")}</span>
              <input
                type="email"
                className="ommm-input"
                placeholder={t("fieldRecipientEmailPlaceholder")}
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                disabled={busy}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldRecipientName")}</span>
              <input
                type="text"
                className="ommm-input"
                placeholder={t("fieldRecipientNamePlaceholder")}
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                disabled={busy}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldMessage")}</span>
              <textarea
                className="ommm-input min-h-24 resize-y"
                placeholder={t("fieldMessagePlaceholder")}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={busy}
              />
            </label>
          </div>
        ) : (
          <p className="text-xs text-sage-500">{t("fieldAssignedUserHiddenHint")}</p>
        )}
      </div>
      <div
        className={
          mode === "edit"
            ? "grid gap-4 sm:grid-cols-2"
            : "flex flex-col gap-1"
        }
      >
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {mode === "edit" ? t("fieldQuantityTotal") : t("fieldQuantity")}
          </span>
          <input
            name="quantity"
            type="number"
            min={minQuantity}
            step={1}
            className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder={t("fieldQuantityPlaceholder")}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={busy}
            required
          />
        </label>
        {mode === "edit" ? (
          <div className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldQuantityRemaining")}
            </span>
            <p
              className="ommm-input flex min-h-[2.75rem] items-center bg-sage-50/80 text-sage-900"
              aria-live="polite"
            >
              {projectedRemaining}
            </p>
            {issuedCount > 0 ? (
              <p className="text-xs text-sage-500">
                {t("fieldQuantityRemainingHint", { issued: issuedCount })}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldImage")}</span>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (imagePreviewUrl !== null) {
              URL.revokeObjectURL(imagePreviewUrl);
            }
            setImageFile(file);
            setImagePreviewUrl(file !== null ? URL.createObjectURL(file) : null);
          }}
          disabled={busy}
        />
        <div className="flex flex-wrap items-center gap-3">
          <OmmButton
            type="button"
            variant="secondary"
            size="sm"
            className="cursor-pointer shadow-sm transition-transform hover:-translate-y-px"
            disabled={busy}
            onClick={() => imageInputRef.current?.click()}
          >
            Choose File
          </OmmButton>
          <span className="text-sm text-sage-700">{imageFile?.name ?? "No file chosen"}</span>
        </div>
        <span className="text-xs text-sage-500">{t("fieldImageHint")}</span>
      </div>
      {imagePreviewUrl !== null ? (
        <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-white/70 bg-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview image supports blob/object URLs */}
          <img
            src={imagePreviewUrl}
            alt={t("fieldImagePreviewAlt")}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldExpiration")}</span>
        <DatePickerInput
          name="expiresAt"
          ariaLabel={t("fieldExpiration")}
          value={expiresAt}
          onChange={setExpiresAt}
          disabled={busy}
        />
      </label>
      {result ? (
        <p
          className={`text-sm ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}
          role="status"
        >
          {result}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <OmmButton type="submit" variant="primary" size="md" disabled={busy}>
          {busy ? t("savingButton") : mode === "edit" ? t("editSaveButton") : t("saveButton")}
        </OmmButton>
        <OmmButton type="button" variant="ghost" size="md" onClick={onCancel} disabled={busy}>
          {t("cancelButton")}
        </OmmButton>
      </div>
    </form>
  );
}
