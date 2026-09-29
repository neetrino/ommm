"use client";

import { useEffect, useState } from "react";
import type { useTranslations } from "next-intl";
import {
  GiftOptionDate,
  GiftOptionSelect,
  GiftOptionText,
} from "@/components/account/custom-gift-option-fields";
import { GIFT_SOFT_FIELD_CARD_CLASS } from "@/components/account/gift-recipient-picker";
import { type OmmSelectOption } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";

export type CustomGiftKind = "FIXED_VALUE" | "FIXED_CLASS";
export type CustomGiftDelivery = "EMAIL" | "WHATSAPP" | "PRINT";

type ClassTypeOption = { id: string; name: string };
type GiftCopy = ReturnType<typeof useTranslations<"userPages.giftCards.customGift">>;

type CustomGiftOptionsProps = {
  kind: CustomGiftKind;
  classTypeId: string;
  classSessions: string;
  delivery: CustomGiftDelivery;
  deliverAt: string;
  guestName: string;
  guestEmail: string;
  disabled: boolean;
  onKindChange: (kind: CustomGiftKind) => void;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
  onDeliveryChange: (delivery: CustomGiftDelivery) => void;
  onDeliverAtChange: (deliverAt: string) => void;
  onGuestNameChange: (guestName: string) => void;
  onGuestEmailChange: (guestEmail: string) => void;
  t: GiftCopy;
};

/** Class gift, delivery, and a recipient who does not have an account yet. */
export function CustomGiftOptions(props: CustomGiftOptionsProps) {
  const classTypes = useClassTypes();
  return (
    <section className="space-y-4">
      <header>
        <h3 className="font-serif text-2xl font-normal leading-tight tracking-tight text-sage-900">
          {props.t("detailsTitle")}
        </h3>
        <p className="mt-1.5 max-w-lg text-sm leading-6 text-sage-500">{props.t("detailsHint")}</p>
      </header>
      <div className={`${GIFT_SOFT_FIELD_CARD_CLASS} grid gap-4 sm:grid-cols-2`}>
        <GiftKindFields {...props} classTypes={classTypes} />
        <GiftDeliveryFields {...props} />
      </div>
    </section>
  );
}

function GiftKindFields({
  kind,
  classTypeId,
  classSessions,
  classTypes,
  disabled,
  t,
  onKindChange,
  onClassTypeChange,
  onClassSessionsChange,
}: CustomGiftOptionsProps & { classTypes: readonly ClassTypeOption[] }) {
  return (
    <>
      <GiftOptionSelect
        className="sm:col-span-2"
        label={t("kindLabel")}
        value={kind}
        disabled={disabled}
        options={kindOptions(t)}
        onChange={(value) => onKindChange(readKind(value))}
      />
      {kind === "FIXED_CLASS" ? (
        <ClassGiftFields
          classTypeId={classTypeId}
          classSessions={classSessions}
          classTypes={classTypes}
          disabled={disabled}
          t={t}
          onClassTypeChange={onClassTypeChange}
          onClassSessionsChange={onClassSessionsChange}
        />
      ) : null}
    </>
  );
}

function GiftDeliveryFields({
  delivery,
  deliverAt,
  guestName,
  guestEmail,
  disabled,
  t,
  onDeliveryChange,
  onDeliverAtChange,
  onGuestNameChange,
  onGuestEmailChange,
}: CustomGiftOptionsProps) {
  return (
    <>
      <GiftOptionSelect
        label={t("deliveryLabel")}
        value={delivery}
        disabled={disabled}
        options={deliveryOptions(t)}
        onChange={(value) => onDeliveryChange(readDelivery(value))}
      />
      <GiftOptionDate
        label={t("deliverAtLabel")}
        value={deliverAt}
        disabled={disabled}
        onChange={onDeliverAtChange}
      />
      <GiftOptionText
        label={t("guestNameLabel")}
        value={guestName}
        disabled={disabled}
        onChange={onGuestNameChange}
      />
      <GiftOptionText
        label={t("guestEmailLabel")}
        value={guestEmail}
        disabled={disabled}
        onChange={onGuestEmailChange}
        type="email"
      />
    </>
  );
}

function ClassGiftFields({
  classTypeId,
  classSessions,
  classTypes,
  disabled,
  t,
  onClassTypeChange,
  onClassSessionsChange,
}: {
  classTypeId: string;
  classSessions: string;
  classTypes: readonly ClassTypeOption[];
  disabled: boolean;
  t: GiftCopy;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
}) {
  return (
    <>
      <GiftOptionSelect
        label={t("classLabel")}
        value={classTypeId}
        disabled={disabled}
        options={classOptions(classTypes, t("classPlaceholder"))}
        onChange={onClassTypeChange}
      />
      <GiftOptionText
        label={t("sessionsLabel")}
        value={classSessions}
        disabled={disabled}
        onChange={onClassSessionsChange}
        inputMode="numeric"
      />
    </>
  );
}

function kindOptions(t: GiftCopy): OmmSelectOption<CustomGiftKind>[] {
  return [
    { value: "FIXED_VALUE", label: t("kindMoney") },
    { value: "FIXED_CLASS", label: t("kindClass") },
  ];
}

function deliveryOptions(t: GiftCopy): OmmSelectOption<CustomGiftDelivery>[] {
  return [
    { value: "EMAIL", label: t("deliveryEmail") },
    { value: "WHATSAPP", label: t("deliveryWhatsapp") },
    { value: "PRINT", label: t("deliveryPrint") },
  ];
}

function classOptions(
  classTypes: readonly ClassTypeOption[],
  placeholder: string,
): OmmSelectOption<string>[] {
  return [
    { value: "", label: placeholder },
    ...classTypes.map((row) => ({ value: row.id, label: row.name })),
  ];
}

function readKind(value: string): CustomGiftKind {
  return value === "FIXED_CLASS" ? "FIXED_CLASS" : "FIXED_VALUE";
}

function readDelivery(value: string): CustomGiftDelivery {
  if (value === "WHATSAPP" || value === "PRINT") {
    return value;
  }
  return "EMAIL";
}

function useClassTypes(): readonly ClassTypeOption[] {
  const [rows, setRows] = useState<readonly ClassTypeOption[]>([]);
  useEffect(() => {
    let cancelled = false;
    void apiFetch<ClassTypeOption[]>("/classes/types")
      .then((next) => {
        if (!cancelled) {
          setRows(next);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return rows;
}
