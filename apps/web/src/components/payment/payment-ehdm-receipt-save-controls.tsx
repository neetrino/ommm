"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { useSaveEhdmReceipt } from "@/hooks/use-save-ehdm-receipt";
import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";
import { OmmButton } from "@/components/ui/omm-button";
import styles from "./payment-ehdm-receipt-printer.module.css";

type PaymentEhdmReceiptSaveControlsProps = {
  paperRef: RefObject<HTMLDivElement | null>;
  reference: string | null;
};

export function PaymentEhdmReceiptSaveControls({
  paperRef,
  reference,
}: PaymentEhdmReceiptSaveControlsProps) {
  const t = useTranslations("userPages.payments.result.ehdm");
  const { busy, error, save } = useSaveEhdmReceipt(paperRef, reference);

  return (
    <div className={styles.controlStack}>
      <div className={styles.controlRow}>
        <OmmButton type="button" onClick={() => void save()} disabled={busy}>
          <DownloadGlyph className={styles.downloadIcon} />
          {busy ? t("downloadBusy") : t("downloadButton")}
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
