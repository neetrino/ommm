"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCreateGiftCardFormFields } from "@/components/admin/admin-create-gift-card-form-fields";
import {
  ADMIN_GIFT_CARD_FORM_MAX_IMAGE_BYTES,
  createGiftCardImagePreviewDataUrl,
  isAcceptedGiftCardImageType,
} from "@/components/admin/admin-create-gift-card-form.helpers";
import type { AdminCreateGiftCardFormProps } from "@/components/admin/admin-create-gift-card-form.types";
import { OmmButton } from "@/components/ui/omm-button";
import { FormErrorBanner } from "@/components/ui/form-validation";
import type { DropdownOption } from "@/components/ui/dropdown-select";
import { ApiError, apiFetch, apiFetchFormData } from "@/lib/api";
import { parseAmdMoneyInput } from "@/lib/price-amd";

export type {
  AdminCreateGiftCardFormInitialValues,
  AdminCreateGiftCardFormProps,
  AdminGiftCardFormMode,
} from "@/components/admin/admin-create-gift-card-form.types";

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
  const imagePreviewRequestRef = useRef(0);
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

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const requestId = imagePreviewRequestRef.current + 1;
    imagePreviewRequestRef.current = requestId;
    setImageFile(null);
    setImagePreviewUrl(null);

    if (file === null) {
      return;
    }
    if (!isAcceptedGiftCardImageType(file.type)) {
      setTone("err");
      setResult(t("imageTypeInvalid"));
      event.target.value = "";
      return;
    }
    if (file.size > ADMIN_GIFT_CARD_FORM_MAX_IMAGE_BYTES) {
      setTone("err");
      setResult(t("imageTooLarge"));
      event.target.value = "";
      return;
    }

    try {
      const previewUrl = await createGiftCardImagePreviewDataUrl(file);
      if (imagePreviewRequestRef.current !== requestId) {
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(previewUrl);
      setResult(null);
    } catch {
      if (imagePreviewRequestRef.current !== requestId) {
        return;
      }
      setTone("err");
      setResult(t("imageTypeInvalid"));
      event.target.value = "";
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || submitLockRef.current) {
      return;
    }
    const parsedAmountAmd = parseAmdMoneyInput(amountAmd);
    const parsedQuantity = Number.parseInt(quantity, 10);
    if (parsedAmountAmd === null || parsedAmountAmd < 1) {
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
      if (!isAcceptedGiftCardImageType(imageFile.type)) {
        setTone("err");
        setResult(t("imageTypeInvalid"));
        return;
      }
      if (imageFile.size > ADMIN_GIFT_CARD_FORM_MAX_IMAGE_BYTES) {
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
      <AdminCreateGiftCardFormFields
        mode={mode}
        amountAmd={amountAmd}
        setAmountAmd={setAmountAmd}
        quantity={quantity}
        setQuantity={setQuantity}
        minQuantity={minQuantity}
        projectedRemaining={projectedRemaining}
        issuedCount={issuedCount}
        showAssignedUser={showAssignedUser}
        setShowAssignedUser={setShowAssignedUser}
        recipientId={recipientId}
        setRecipientId={setRecipientId}
        recipientEmail={recipientEmail}
        setRecipientEmail={setRecipientEmail}
        recipientName={recipientName}
        setRecipientName={setRecipientName}
        message={message}
        setMessage={setMessage}
        expiresAt={expiresAt}
        setExpiresAt={setExpiresAt}
        recipientOptions={recipientOptions}
        imageInputRef={imageInputRef}
        imageFile={imageFile}
        imagePreviewUrl={imagePreviewUrl}
        onImageChange={handleImageChange}
        busy={busy}
        t={t}
      />
      {result && tone === "err" ? (
        <FormErrorBanner message={result} variant="inline" />
      ) : null}
      {result && tone === "ok" ? (
        <p className="text-sm text-sage-700" role="status">
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
