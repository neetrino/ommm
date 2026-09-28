"use client";

import { useEffect, useState } from "react";
import type { useTranslations } from "next-intl";
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
  classSessions: string;
  disabled: boolean;
  onKindChange: (kind: AdminGiftCardKind) => void;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>;
};

/** Money or class-session gift. Class cards are minted only on create. */
export function AdminGiftCardKindFields({
  kind,
  classTypeId,
  classSessions,
  disabled,
  onKindChange,
  onClassTypeChange,
  onClassSessionsChange,
  t,
}: AdminGiftCardKindFieldsProps) {
  const classOptions = useClassTypeOptions(t("fieldClassType"));
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
          classSessions={classSessions}
          classOptions={classOptions}
          disabled={disabled}
          onClassTypeChange={onClassTypeChange}
          onClassSessionsChange={onClassSessionsChange}
          t={t}
        />
      ) : null}
    </div>
  );
}

function ClassSessionFields({
  classTypeId,
  classSessions,
  classOptions,
  disabled,
  onClassTypeChange,
  onClassSessionsChange,
  t,
}: {
  classTypeId: string;
  classSessions: string;
  classOptions: readonly DropdownOption<string>[];
  disabled: boolean;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>;
}) {
  return (
    <>
      <DropdownSelect
        label={t("fieldClassType")}
        ariaLabel={t("fieldClassType")}
        value={classTypeId}
        options={classOptions}
        onChange={onClassTypeChange}
        disabled={disabled}
        wrapLabel
        searchable
      />
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldClassSessions")}</span>
        <input
          name="classQuantity"
          type="number"
          min={1}
          step={1}
          className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          value={classSessions}
          onChange={(event) => onClassSessionsChange(event.target.value)}
          disabled={disabled}
          required
        />
      </label>
    </>
  );
}

function kindOptions(
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
): readonly DropdownOption<AdminGiftCardKind>[] {
  return [
    { value: "FIXED_VALUE", label: t("fieldCardKindMoney") },
    { value: "FIXED_CLASS", label: t("fieldCardKindClass") },
  ];
}

function useClassTypeOptions(placeholder: string): readonly DropdownOption<string>[] {
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
  return [
    { value: "", label: placeholder },
    ...types.map((row) => ({ value: row.id, label: row.name })),
  ];
}
