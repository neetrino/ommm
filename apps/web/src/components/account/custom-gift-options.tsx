"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";

export type CustomGiftKind = "FIXED_VALUE" | "FIXED_CLASS";
export type CustomGiftDelivery = "EMAIL" | "WHATSAPP" | "PRINT";

type ClassTypeOption = { id: string; name: string };

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
  t: ReturnType<typeof useTranslations<"userPages.giftCards.customGift">>;
};

/** Class gift, delivery, and a recipient who does not have an account yet. */
export function CustomGiftOptions(props: CustomGiftOptionsProps) {
  const classTypes = useClassTypes();
  return (
    <div className="grid gap-4">
      <SelectField label={props.t("kindLabel")} value={props.kind} disabled={props.disabled} onChange={(value) => props.onKindChange(value === "FIXED_CLASS" ? "FIXED_CLASS" : "FIXED_VALUE")}>
        <option value="FIXED_VALUE">{props.t("kindMoney")}</option>
        <option value="FIXED_CLASS">{props.t("kindClass")}</option>
      </SelectField>
      {props.kind === "FIXED_CLASS" ? (
        <>
          <SelectField label={props.t("classLabel")} value={props.classTypeId} disabled={props.disabled} onChange={props.onClassTypeChange}>
            <option value="">{props.t("classPlaceholder")}</option>
            {classTypes.map((row) => (
              <option key={row.id} value={row.id}>{row.name}</option>
            ))}
          </SelectField>
          <TextField label={props.t("sessionsLabel")} value={props.classSessions} disabled={props.disabled} onChange={props.onClassSessionsChange} inputMode="numeric" />
        </>
      ) : null}
      <SelectField label={props.t("deliveryLabel")} value={props.delivery} disabled={props.disabled} onChange={(value) => props.onDeliveryChange(readDelivery(value))}>
        <option value="EMAIL">{props.t("deliveryEmail")}</option>
        <option value="WHATSAPP">{props.t("deliveryWhatsapp")}</option>
        <option value="PRINT">{props.t("deliveryPrint")}</option>
      </SelectField>
      <TextField label={props.t("deliverAtLabel")} value={props.deliverAt} disabled={props.disabled} onChange={props.onDeliverAtChange} type="date" />
      <TextField label={props.t("guestNameLabel")} value={props.guestName} disabled={props.disabled} onChange={props.onGuestNameChange} />
      <TextField label={props.t("guestEmailLabel")} value={props.guestEmail} disabled={props.disabled} onChange={props.onGuestEmailChange} type="email" />
    </div>
  );
}

function SelectField({
  label,
  value,
  disabled,
  onChange,
  children,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <select className="ommm-input" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  disabled,
  onChange,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <input className="ommm-input" type={type} inputMode={inputMode} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
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
