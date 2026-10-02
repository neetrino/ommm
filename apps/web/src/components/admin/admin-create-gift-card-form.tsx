"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCreateGiftCardFormFields } from "@/components/admin/admin-create-gift-card-form-fields";
import { GiftCardFace } from "@/components/gift-cards/gift-card-face";
import {
  AdminGiftCardKindFields,
  readClassGiftCreate,
  type AdminGiftCardKind,
} from "@/components/admin/admin-gift-card-kind-fields";
import { ADMIN_GIFT_CARD_FORM_DEFAULT_AMOUNT_AMD } from "@/components/admin/admin-create-gift-card-form.helpers";
import type { AdminCreateGiftCardFormProps } from "@/components/admin/admin-create-gift-card-form.types";
import { OmmButton } from "@/components/ui/omm-button";
import { FormErrorBanner } from "@/components/ui/form-validation";
import type { DropdownOption } from "@/components/ui/dropdown-select";
import { ApiError, apiFetch } from "@/lib/api";
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
  const [cardKind, setCardKind] = useState<AdminGiftCardKind>("FIXED_VALUE");
  const [classTypeId, setClassTypeId] = useState("");
  const [classSessions, setClassSessions] = useState("1");
  const [amountAmd, setAmountAmd] = useState(
    String(initialValues?.amountAmd ?? ADMIN_GIFT_CARD_FORM_DEFAULT_AMOUNT_AMD),
  );
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
  const [message, setMessage] = useState(initialValues?.message ?? "");
  const [expiresAt, setExpiresAt] = useState(initialValues?.expiresAt ?? "");
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || submitLockRef.current) {
      return;
    }
    const isClassGift = mode === "create" && cardKind === "FIXED_CLASS";
    const classGift = readClassGiftCreate({ isClassGift, classTypeId, classSessions });
    const parsedAmountAmd = parseAmdMoneyInput(amountAmd);
    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!classGift.ok) {
      setTone("err");
      setResult(t("classGiftInvalid"));
      return;
    }
    if (!isClassGift && (parsedAmountAmd === null || parsedAmountAmd < 1)) {
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
            message: message.trim().length > 0 ? message.trim() : undefined,
            expiresAt: expiresAt.trim().length > 0 ? expiresAt.trim() : undefined,
          }),
        });
        onSaved(1);
        return;
      }

      const created = await apiFetch<unknown>("/gift-cards/admin", {
        method: "POST",
        body: JSON.stringify({
          quantity: parsedQuantity,
          type: isClassGift ? "FIXED_CLASS" : "FIXED_VALUE",
          amountAmd: isClassGift ? undefined : parsedAmountAmd,
          classTypeId: isClassGift ? classTypeId : undefined,
          classQuantity: isClassGift ? classGift.sessions : undefined,
          recipientId: recipientId.trim().length > 0 ? recipientId.trim() : undefined,
          message: message.trim().length > 0 ? message.trim() : undefined,
        }),
      });
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
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="ommm-soft-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-y-contain p-5 sm:p-6">
      {mode === "create" ? (
        <GiftCardFace alt={t("cardImageAlt")} className="aspect-[1.58/1] overflow-hidden rounded-[22px]" />
      ) : null}
      {mode === "create" ? (
        <AdminGiftCardKindFields
          kind={cardKind}
          classTypeId={classTypeId}
          disabled={busy}
          onKindChange={setCardKind}
          onClassTypeChange={setClassTypeId}
          onClassSessionsChange={setClassSessions}
          t={t}
        />
      ) : null}
      <AdminCreateGiftCardFormFields
        mode={mode}
        hideAmount={mode === "create" && cardKind === "FIXED_CLASS"}
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
        message={message}
        setMessage={setMessage}
        expiresAt={expiresAt}
        setExpiresAt={setExpiresAt}
        recipientOptions={recipientOptions}
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
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-sage-200/70 bg-paper px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6">
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
