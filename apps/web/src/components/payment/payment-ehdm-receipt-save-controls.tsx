"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { useSaveEhdmReceipt } from "@/hooks/use-save-ehdm-receipt";
import { OmmButton } from "@/components/ui/omm-button";
import styles from "./payment-ehdm-receipt-printer.module.css";

type PaymentEhdmReceiptSaveControlsProps = {
  paperRef: RefObject<HTMLDivElement | null>;
  reference: string | null;
  onReprint: () => void;
};

export function PaymentEhdmReceiptSaveControls({
  paperRef,
  reference,
  onReprint,
}: PaymentEhdmReceiptSaveControlsProps) {
  const t = useTranslations("userPages.payments.result.ehdm");
  const { busy, error, save } = useSaveEhdmReceipt(paperRef, reference);

  return (
    <div className={styles.controlStack}>
      <div className={styles.controlRow}>
        <OmmButton type="button" onClick={() => void save()} disabled={busy}>
          {busy ? t("saveBusy") : t("saveButton")}
        </OmmButton>
        <OmmButton type="button" variant="secondary" onClick={onReprint} disabled={busy}>
          {t("reprintButton")}
        </OmmButton>
      </div>
      {error ? (
        <p className={styles.saveStatus} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
