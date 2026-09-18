import { useCallback, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { saveEhdmReceiptPng } from "@/lib/save-ehdm-receipt";

type UseSaveEhdmReceiptResult = {
  busy: boolean;
  error: string | null;
  save: () => Promise<void>;
};

export function useSaveEhdmReceipt(
  paperRef: RefObject<HTMLDivElement | null>,
  reference: string | null,
): UseSaveEhdmReceiptResult {
  const t = useTranslations("userPages.payments.result.ehdm");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async () => {
    const node = paperRef.current;
    if (!node || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveEhdmReceiptPng({ node, reference });
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
    }
  }, [busy, paperRef, reference, t]);

  return { busy, error, save };
}
