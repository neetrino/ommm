"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { toAdminEhdmReceiptPayload } from "@/components/admin/admin-finance-ehdm-receipt-payload";
import { ADMIN_CENTERED_MODAL_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { PaymentEhdmReceiptPrinter } from "@/components/payment/payment-ehdm-receipt-printer";
import { OmmButton } from "@/components/ui/omm-button";

type AdminFinancePaymentEhdmPrinterProps = {
  payment: FinancePaymentItem;
  locale: string;
};

export function AdminFinancePaymentEhdmPrinter({
  payment,
  locale,
}: AdminFinancePaymentEhdmPrinterProps) {
  const tReceipt = useTranslations("userPages.payments.result.ehdm");
  const payload = toAdminEhdmReceiptPayload(payment);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!payload) {
    return null;
  }

  return (
    <>
      <div className="mt-5 rounded-2xl border border-sage-200/80 bg-white px-3 py-5 shadow-[0_12px_32px_-18px_rgba(45,40,35,0.28)] sm:px-4">
        <OmmButton type="button" className="w-full" onClick={() => setPreviewOpen(true)}>
          {tReceipt("printButton")}
        </OmmButton>
      </div>
      {previewOpen ? (
        <AdminFinanceEhdmReceiptPrintModal
          locale={locale}
          payload={payload}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </>
  );
}

function AdminFinanceEhdmReceiptPrintModal({
  locale,
  payload,
  onClose,
}: {
  locale: string;
  payload: NonNullable<ReturnType<typeof toAdminEhdmReceiptPayload>>;
  onClose: () => void;
}) {
  const t = useTranslations("adminPages.finance");
  const titleId = useId();
  const { isOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);

  return (
    <AdminSheetPortal
      presentation="modal"
      forceCenteredModal
      isOpen={isOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      ariaLabelledBy={titleId}
      backdropAriaLabel={t("paymentDetails.closeBackdrop")}
      modalOverlayClassName="ommm-modal-overlay z-[130] items-center justify-center p-4"
      modalPanelClassName="relative w-full max-w-md max-h-[min(92vh,54rem)] overflow-y-auto rounded-[2rem] border border-white/80 bg-paper px-4 py-5 shadow-[0_28px_80px_-42px_rgba(45,40,35,0.45)] sm:px-6 sm:py-6"
    >
      <div className="mb-2 flex items-start justify-end">
        <button
          type="button"
          className={ADMIN_CENTERED_MODAL_CLOSE_BUTTON_CLASS}
          aria-label={t("paymentDetails.close")}
          onClick={requestClose}
        >
          ×
        </button>
      </div>
      <h2 id={titleId} className="sr-only">
        {t("paymentDetails.ehdmReceipt")}
      </h2>
      <PaymentEhdmReceiptPrinter payload={payload} locale={locale} autoStartPrint />
    </AdminSheetPortal>
  );
}
