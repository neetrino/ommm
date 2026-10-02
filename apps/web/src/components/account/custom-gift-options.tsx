"use client";

import { useEffect, useState } from "react";
import type { useTranslations } from "next-intl";
import {
  GiftOptionDate,
  GiftOptionText,
} from "@/components/account/custom-gift-option-fields";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
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

/** First question: money or class sessions, then the class fields. */
export function CustomGiftKindSection(props: CustomGiftOptionsProps) {
  const classTypes = useClassTypes();
  return (
    <div className="grid gap-3">
      <DropdownSelect
        label={props.t("kindLabel")}
        ariaLabel={props.t("kindLabel")}
        value={props.kind}
        options={kindOptions(props.t)}
        disabled={props.disabled}
        wrapLabel
        onChange={(value) => props.onKindChange(readKind(value))}
      />
      {props.kind === "FIXED_CLASS" ? (
        <ClassGiftFields
          classTypeId={props.classTypeId}
          classSessions={props.classSessions}
          classTypes={classTypes}
          disabled={props.disabled}
          t={props.t}
          onClassTypeChange={props.onClassTypeChange}
          onClassSessionsChange={props.onClassSessionsChange}
        />
      ) : null}
    </div>
  );
}

/** Delivery channel, send date, and a guest who does not have an account yet. */
export function CustomGiftDeliverySection(props: CustomGiftOptionsProps) {
  return (
    <div className="grid gap-3">
      <GiftDeliveryFields {...props} />
    </div>
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
      <DropdownSelect
        label={t("deliveryLabel")}
        ariaLabel={t("deliveryLabel")}
        value={delivery}
        options={deliveryOptions(t)}
        disabled={disabled}
        wrapLabel
        onChange={(value) => onDeliveryChange(readDelivery(value))}
      />
      <GiftOptionDate
        label={t("deliverAtLabel")}
        value={deliverAt}
        disabled={disabled}
        plain
        onChange={onDeliverAtChange}
      />
      <GiftOptionText
        label={t("guestNameLabel")}
        value={guestName}
        disabled={disabled}
        plain
        onChange={onGuestNameChange}
      />
      <GiftOptionText
        label={t("guestEmailLabel")}
        value={guestEmail}
        disabled={disabled}
        plain
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
      <DropdownSelect
        label={t("classLabel")}
        ariaLabel={t("classLabel")}
        value={classTypeId}
        options={classOptions(classTypes, t("classLabel"))}
        disabled={disabled}
        wrapLabel
        searchable
        onChange={onClassTypeChange}
      />
      <GiftOptionText
        label={t("sessionsLabel")}
        value={classSessions}
        disabled={disabled}
        plain
        type="number"
        onChange={onClassSessionsChange}
      />
    </>
  );
}

function kindOptions(t: GiftCopy): readonly DropdownOption<CustomGiftKind>[] {
  return [
    { value: "FIXED_VALUE", label: t("kindMoney") },
    { value: "FIXED_CLASS", label: t("kindClass") },
  ];
}

function deliveryOptions(t: GiftCopy): readonly DropdownOption<CustomGiftDelivery>[] {
  return [
    { value: "EMAIL", label: t("deliveryEmail") },
    { value: "WHATSAPP", label: t("deliveryWhatsapp") },
    { value: "PRINT", label: t("deliveryPrint") },
  ];
}

function classOptions(
  classTypes: readonly ClassTypeOption[],
  placeholder: string,
): readonly DropdownOption<string>[] {
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
