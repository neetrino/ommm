"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { apiFetch, ApiError } from "@/lib/api";

export type GiftRecipientOption = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
};

const RECIPIENT_SEARCH_MIN_CHARS = 2;
const RECIPIENT_SEARCH_DEBOUNCE_MS = 280;

type GiftRecipientPickerProps = {
  selected: GiftRecipientOption | null;
  onSelect: (value: GiftRecipientOption | null) => void;
  disabled?: boolean;
};

/** Search and select a studio member as the gift card recipient. */
export function GiftRecipientPicker({
  selected,
  onSelect,
  disabled = false,
}: GiftRecipientPickerProps) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const listboxId = useId();
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<GiftRecipientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, RECIPIENT_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < RECIPIENT_SEARCH_MIN_CHARS) {
      requestIdRef.current += 1;
      setResults([]);
      setError(null);
      setLoading(false);
      setListOpen(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    async function search() {
      setLoading(true);
      setError(null);
      setListOpen(true);
      try {
        const rows = await apiFetch<GiftRecipientOption[]>(
          `/gift-cards/recipients?q=${encodeURIComponent(debouncedQuery)}`,
        );
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }
        setResults(rows);
        setListOpen(true);
      } catch (err) {
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }
        setResults([]);
        setError(err instanceof ApiError ? err.message : t("recipientSearchFailed"));
        setListOpen(true);
      } finally {
        if (!cancelled && requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    }

    void search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, t]);

  function selectRecipient(row: GiftRecipientOption) {
    onSelect(row);
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setListOpen(false);
    setError(null);
  }

  function clearRecipient() {
    onSelect(null);
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setError(null);
    setListOpen(false);
  }

  const showResultsPanel =
    selected === null &&
    listOpen &&
    (loading || error !== null || debouncedQuery.length >= RECIPIENT_SEARCH_MIN_CHARS);

  return (
    <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] sm:p-5">
      <p className="text-sm font-medium text-sage-800">{t("recipientSectionLabel")}</p>
      <p className="mt-1 text-xs leading-5 text-sage-500">{t("recipientSectionHint")}</p>

      <div className="mt-4 space-y-3">
        {selected !== null ? (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-sage-700/30 bg-sage-50 px-3 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
                  {t("recipientSelectedLabel")}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-sage-950">
                  {formatRecipientLabel(selected)}
                </p>
                <p className="truncate text-xs text-sage-600">{selected.email}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-red-800 transition-colors hover:border-red-300 hover:bg-red-50"
                disabled={disabled}
                onClick={clearRecipient}
              >
                {t("recipientRemove")}
              </button>
            </div>
            <p className="text-xs text-sage-500">{t("recipientRemoveHint")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="ommm-label flex flex-col gap-2">
              {t("recipientSearchLabel")}
              <input
                type="text"
                role="combobox"
                aria-expanded={showResultsPanel}
                aria-controls={listboxId}
                aria-autocomplete="list"
                value={query}
                disabled={disabled}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setListOpen(true);
                }}
                onFocus={() => {
                  if (debouncedQuery.length >= RECIPIENT_SEARCH_MIN_CHARS) {
                    setListOpen(true);
                  }
                }}
                className="ommm-input"
                placeholder={t("recipientSearchPlaceholder")}
                autoComplete="off"
                spellCheck={false}
              />
            </label>

            {query.trim().length > 0 && query.trim().length < RECIPIENT_SEARCH_MIN_CHARS ? (
              <p className="text-xs text-sage-500">{t("recipientSearchHint")}</p>
            ) : null}

            {showResultsPanel ? (
              <div
                id={listboxId}
                role="listbox"
                className="max-h-60 overflow-y-auto rounded-2xl border border-sage-200 bg-white shadow-[0_12px_28px_-18px_rgba(45,40,35,0.28)]"
              >
                {loading ? (
                  <p className="px-3 py-3 text-sm text-sage-500">{t("recipientSearching")}</p>
                ) : null}
                {error !== null ? (
                  <p className="px-3 py-3 text-sm text-red-800" role="alert">
                    {error}
                  </p>
                ) : null}
                {!loading && error === null && results.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-sage-500">{t("recipientEmpty")}</p>
                ) : null}
                {!loading && error === null
                  ? results.map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        role="option"
                        aria-selected={false}
                        disabled={disabled}
                        className="flex w-full flex-col items-start gap-0.5 border-b border-sage-50 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-sand-50 focus-visible:bg-sand-50 focus-visible:outline-none"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          selectRecipient(row);
                        }}
                        onClick={() => selectRecipient(row)}
                      >
                        <span className="text-sm font-semibold text-sage-950">
                          {formatRecipientLabel(row)}
                        </span>
                        <span className="text-xs text-sage-500">{row.email}</span>
                      </button>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

export function formatRecipientLabel(user: GiftRecipientOption): string {
  const name = [user.name, user.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();
  return name.length > 0 ? name : user.email;
}
