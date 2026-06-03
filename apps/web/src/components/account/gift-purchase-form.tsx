"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type GiftBatchMarketItem = {
  id: string;
  amountCents: number;
  imageUrl: string | null;
  availableQuantity: number;
  totalQuantity: number;
  expiresAt: string | null;
  status: string;
};

export function GiftPurchaseForm() {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const [items, setItems] = useState<GiftBatchMarketItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadMarket() {
      setLoading(true);
      setError(null);
      try {
        const rows = await apiFetch<GiftBatchMarketItem[]>("/gift-cards/market");
        if (cancelled) {
          return;
        }
        setItems(rows);
        if (rows.length > 0) {
          setSelectedBatchId(rows[0].id);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof ApiError ? err.message : t("loadFailed"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadMarket();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const selectedBatch = items.find((item) => item.id === selectedBatchId) ?? null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedBatch == null) {
      setStatus(t("selectRequired"));
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const { url } = await apiFetch<{ url: string | null }>(
        "/payments/checkout/gift",
        {
          method: "POST",
          body: JSON.stringify({
            batchId: selectedBatch.id,
            amountCents: selectedBatch.amountCents,
            recipientEmail: recipientEmail.trim() || undefined,
            recipientName: recipientName.trim() || undefined,
            message: message.trim() || undefined,
          }),
        },
      );
      if (url) {
        window.location.href = url;
        return;
      }
      setStatus(t("checkoutUnavailable"));
    } catch (err) {
      setStatus(err instanceof ApiError ? err.message : t("checkoutFailed"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-sage-500">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-sage-500">{t("empty")}</p>;
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="flex flex-col gap-3">
      <label className="ommm-label flex flex-col gap-2">
        {t("selectLabel")}
        <select
          className="ommm-input"
          value={selectedBatchId}
          onChange={(ev) => setSelectedBatchId(ev.target.value)}
          disabled={busy}
          required
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {formatAmdFromCents(item.amountCents, "hy")} - {t("availableShort", { available: item.availableQuantity })}
            </option>
          ))}
        </select>
      </label>
      {selectedBatch ? (
        <div className="rounded-2xl border border-white/60 bg-white/75 p-3">
          <div className="mb-2 overflow-hidden rounded-xl border border-white/70 bg-sage-100">
            {selectedBatch.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- supports API and R2 URLs
              <img
                src={resolveApiAssetUrl(selectedBatch.imageUrl) ?? selectedBatch.imageUrl}
                alt={t("selectedImageAlt")}
                className="h-28 w-full object-cover"
              />
            ) : (
              <div className="flex h-28 items-center justify-center text-sm text-sage-600">{t("noImage")}</div>
            )}
          </div>
          <p className="text-sm text-sage-700">
            {t("selectedSummary", {
              amount: formatAmdFromCents(selectedBatch.amountCents, "hy"),
              available: selectedBatch.availableQuantity,
              total: selectedBatch.totalQuantity,
            })}
          </p>
        </div>
      ) : null}
      <label className="ommm-label flex flex-col gap-2">
        {t("recipientEmail")}
        <input
          value={recipientEmail}
          onChange={(ev) => setRecipientEmail(ev.target.value)}
          type="email"
          className="ommm-input"
        />
      </label>
      <label className="ommm-label flex flex-col gap-2">
        {t("recipientName")}
        <input
          value={recipientName}
          onChange={(ev) => setRecipientName(ev.target.value)}
          className="ommm-input"
        />
      </label>
      <label className="ommm-label flex flex-col gap-2">
        {t("message")}
        <input
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          className="ommm-input"
        />
      </label>
      <OmmButton type="submit" variant="primary" disabled={busy}>
        {t("submit")}
      </OmmButton>
      {status ? <p className="text-sm text-sage-500">{status}</p> : null}
    </form>
  );
}
