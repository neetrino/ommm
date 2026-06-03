"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetchFormData } from "@/lib/api";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import type { AdminAssignableUser } from "@/components/admin/admin-gift-cards-types";

type AdminCreateGiftCardFormProps = {
  users: readonly AdminAssignableUser[];
  onSaved: (createdCount: number) => void;
  onCancel: () => void;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function AdminCreateGiftCardForm({ users, onSaved, onCancel }: AdminCreateGiftCardFormProps) {
  const t = useTranslations("adminPages.giftCards");
  const submitLockRef = useRef(false);
  const [amountCents, setAmountCents] = useState("10000");
  const [quantity, setQuantity] = useState("1");
  const [showAssignedUser, setShowAssignedUser] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
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
    const parsedAmount = Number.parseInt(amountCents, 10);
    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setTone("err");
      setResult(t("amountInvalid"));
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setTone("err");
      setResult(t("quantityInvalid"));
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
      const formData = new FormData();
      formData.append("amountCents", String(parsedAmount));
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
      const createdCount = Array.isArray(created) ? created.length : 1;
      onSaved(createdCount);
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
          name="amountCents"
          type="number"
          min={1}
          className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder={t("fieldAmountPlaceholder")}
          value={amountCents}
          onChange={(event) => setAmountCents(event.target.value)}
          disabled={busy}
          required
        />
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldAssignedUser")}</span>
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
            {showAssignedUser ? t("hideAssignedUserButton") : t("showAssignedUserButton")}
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
          </div>
        ) : (
          <p className="text-xs text-sage-500">{t("fieldAssignedUserHiddenHint")}</p>
        )}
      </div>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldQuantity")}</span>
        <input
          name="quantity"
          type="number"
          min={1}
          step={1}
          className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder={t("fieldQuantityPlaceholder")}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          disabled={busy}
          required
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldImage")}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
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
        <span className="text-xs text-sage-500">{t("fieldImageHint")}</span>
      </label>
      {imagePreviewUrl !== null ? (
        <div className="relative aspect-[16/10] w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white/70">
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
          {busy ? t("savingButton") : t("saveButton")}
        </OmmButton>
        <OmmButton type="button" variant="ghost" size="md" onClick={onCancel} disabled={busy}>
          {t("cancelButton")}
        </OmmButton>
      </div>
    </form>
  );
}
