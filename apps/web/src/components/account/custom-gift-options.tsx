"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CustomGiftClassChoices } from "@/components/account/custom-gift-class-schedule";
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
  onQuotedPriceChange: (amountAmd: number | null) => void;
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
        onChange={(value) => {
          const next = readKind(value);
          props.onKindChange(next);
          if (next !== "FIXED_CLASS") {
            props.onClassTypeChange("");
            props.onQuotedPriceChange(null);
          }
        }}
      />
      {props.kind === "FIXED_CLASS" ? (
        <ClassGiftFields
          classTypeId={props.classTypeId}
          classTypes={classTypes}
          disabled={props.disabled}
          t={props.t}
          onClassTypeChange={props.onClassTypeChange}
          onClassSessionsChange={props.onClassSessionsChange}
          onQuotedPriceChange={props.onQuotedPriceChange}
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
        placeholder={t("guestNamePlaceholder")}
        onChange={onGuestNameChange}
      />
      <GiftOptionText
        label={t("guestEmailLabel")}
        value={guestEmail}
        disabled={disabled}
        plain
        placeholder={t("guestEmailPlaceholder")}
        onChange={onGuestEmailChange}
        type="email"
      />
    </>
  );
}

function ClassGiftFields({
  classTypeId,
  classTypes,
  disabled,
  t,
  onClassTypeChange,
  onClassSessionsChange,
  onQuotedPriceChange,
}: {
  classTypeId: string;
  classTypes: readonly ClassTypeOption[];
  disabled: boolean;
  t: GiftCopy;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
  onQuotedPriceChange: (amountAmd: number | null) => void;
}) {
  const page = useTranslations("userPages.giftCards");
  return (
    <CustomGiftClassChoices
      classTypeId={classTypeId}
      classTypes={classTypes}
      disabled={disabled}
      classPlaceholder={t("classPlaceholder")}
      classTypeLabel={page("cartClassType")}
      packageLabel={page("cartPackage")}
      sessionLabel={page("cartSession")}
      skipLabel={page("cartSkip")}
      priceCaption={t("priceLabel")}
      onClassTypeChange={onClassTypeChange}
      onClassSessionsChange={onClassSessionsChange}
      onQuotedPriceChange={onQuotedPriceChange}
    />
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
