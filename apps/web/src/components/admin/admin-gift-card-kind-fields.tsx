"use client";

import { useEffect, useState } from "react";
import { useTranslations, type useTranslations as UseTranslations } from "next-intl";
import { CustomGiftClassChoices } from "@/components/account/custom-gift-class-schedule";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { apiFetch } from "@/lib/api";

export type AdminGiftCardKind = "FIXED_VALUE" | "FIXED_CLASS";

type ClassGiftCreate =
  | { ok: true; sessions: number }
  | { ok: false };

/** Class cards omit the money amount and send the class shape instead. */
export function readClassGiftCreate(input: {
  isClassGift: boolean;
  classTypeId: string;
  classSessions: string;
}): ClassGiftCreate {
  if (!input.isClassGift) {
    return { ok: true, sessions: 0 };
  }
  const sessions = Number.parseInt(input.classSessions, 10);
  const missingClass = input.classTypeId.length === 0;
  const missingSessions = !Number.isFinite(sessions) || sessions < 1;
  if (missingClass || missingSessions) {
    return { ok: false };
  }
  return { ok: true, sessions };
}

export function appendGiftCreateAmount(
  formData: FormData,
  input: {
    isClassGift: boolean;
    classTypeId: string;
    sessions: number;
    amountAmd: number;
  },
): void {
  if (input.isClassGift) {
    formData.append("type", "FIXED_CLASS");
    formData.append("classTypeId", input.classTypeId);
    formData.append("classQuantity", String(input.sessions));
    return;
  }
  formData.append("amountAmd", String(input.amountAmd));
}

type ClassTypeOption = {
  id: string;
  name: string;
};

type AdminGiftCardKindFieldsProps = {
  kind: AdminGiftCardKind;
  classTypeId: string;
  disabled: boolean;
  onKindChange: (kind: AdminGiftCardKind) => void;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
  t: ReturnType<UseTranslations<"adminPages.giftCards">>;
};

/** Money or class-session gift. Class cards are minted only on create. */
export function AdminGiftCardKindFields({
  kind,
  classTypeId,
  disabled,
  onKindChange,
  onClassTypeChange,
  onClassSessionsChange,
  t,
}: AdminGiftCardKindFieldsProps) {
  return (
    <div className="grid gap-3">
      <DropdownSelect
        label={t("fieldCardKind")}
        ariaLabel={t("fieldCardKind")}
        value={kind}
        options={kindOptions(t)}
        onChange={(value) => onKindChange(value === "FIXED_CLASS" ? "FIXED_CLASS" : "FIXED_VALUE")}
        disabled={disabled}
        wrapLabel
      />
      {kind === "FIXED_CLASS" ? (
        <ClassSessionFields
          classTypeId={classTypeId}
          disabled={disabled}
          onClassTypeChange={onClassTypeChange}
          onClassSessionsChange={onClassSessionsChange}
        />
      ) : null}
    </div>
  );
}

function ClassSessionFields({
  classTypeId,
  disabled,
  onClassTypeChange,
  onClassSessionsChange,
}: {
  classTypeId: string;
  disabled: boolean;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
}) {
  const page = useTranslations("userPages.giftCards");
  const custom = useTranslations("userPages.giftCards.customGift");
  const classTypes = useClassTypes();
  return (
    <CustomGiftClassChoices
      classTypeId={classTypeId}
      classTypes={classTypes}
      disabled={disabled}
      classPlaceholder={custom("classPlaceholder")}
      classTypeLabel={page("cartClassType")}
      packageLabel={page("cartPackage")}
      sessionLabel={page("cartSession")}
      skipLabel={page("cartSkip")}
      priceCaption={custom("priceLabel")}
      onClassTypeChange={onClassTypeChange}
      onClassSessionsChange={onClassSessionsChange}
      onQuotedPriceChange={() => undefined}
    />
  );
}

function kindOptions(
  t: ReturnType<UseTranslations<"adminPages.giftCards">>,
): readonly DropdownOption<AdminGiftCardKind>[] {
  return [
    { value: "FIXED_VALUE", label: t("fieldCardKindMoney") },
    { value: "FIXED_CLASS", label: t("fieldCardKindClass") },
  ];
}

function useClassTypes(): readonly ClassTypeOption[] {
  const [types, setTypes] = useState<readonly ClassTypeOption[]>([]);
  useEffect(() => {
    let cancelled = false;
    void apiFetch<ClassTypeOption[]>("/classes/types")
      .then((rows) => {
        if (!cancelled) {
          setTypes(rows);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return types;
}
