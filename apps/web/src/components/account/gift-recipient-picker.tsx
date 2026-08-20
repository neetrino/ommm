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

export type GiftPurchaseDestination = "self" | "gift";

const RECIPIENT_SEARCH_MIN_CHARS = 2;
const RECIPIENT_SEARCH_DEBOUNCE_MS = 280;

type GiftRecipientPickerProps = {
  destination: GiftPurchaseDestination;
  onDestinationChange: (value: GiftPurchaseDestination) => void;
  selected: GiftRecipientOption | null;
  onSelect: (value: GiftRecipientOption | null) => void;
  disabled?: boolean;
};

/** Myself vs gift-to-member, with searchable selectable recipient results. */
export function GiftRecipientPicker({
  destination,
  onDestinationChange,
  selected,
  onSelect,
  disabled = false,
}: GiftRecipientPickerProps) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const groupName = useId();
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
    if (destination !== "gift") {
      requestIdRef.current += 1;
      setResults([]);
      setError(null);
      setLoading(false);
      setListOpen(false);
      return;
    }

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
  }, [debouncedQuery, destination, t]);

  function selectRecipient(row: GiftRecipientOption) {
    onSelect(row);
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setListOpen(false);
    setError(null);
  }

  const showResultsPanel =
    destination === "gift" &&
    selected === null &&
    listOpen &&
    (loading || error !== null || debouncedQuery.length >= RECIPIENT_SEARCH_MIN_CHARS);

  return (
    <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] sm:p-5">
      <p className="text-sm font-medium text-sage-800">{t("destinationLabel")}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t("destinationLabel")}>
        <DestinationOption
          name={groupName}
          checked={destination === "self"}
          disabled={disabled}
          label={t("destinationSelf")}
          description={t("destinationSelfHint")}
          onSelect={() => {
            onDestinationChange("self");
            onSelect(null);
            setQuery("");
            setDebouncedQuery("");
            setResults([]);
            setListOpen(false);
          }}
        />
        <DestinationOption
          name={groupName}
          checked={destination === "gift"}
          disabled={disabled}
          label={t("destinationGift")}
          description={t("destinationGiftHint")}
          onSelect={() => onDestinationChange("gift")}
        />
      </div>

      {destination === "gift" ? (
        <div className="mt-4 space-y-3">
          {selected !== null ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-sage-700/30 bg-sage-50 px-3 py-3">
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
                className="shrink-0 rounded-full border border-sage-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-sage-700 transition-colors hover:border-sage-300 hover:text-sage-950"
                disabled={disabled}
                onClick={() => {
                  onSelect(null);
                  setListOpen(false);
                }}
              >
                {t("recipientClear")}
              </button>
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
      ) : null}
    </section>
  );
}

function DestinationOption({
  name,
  checked,
  disabled,
  label,
  description,
  onSelect,
}: {
  name: string;
  checked: boolean;
  disabled: boolean;
  label: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-3 text-left transition-[border-color,background-color,box-shadow] ${
        checked
          ? "border-sage-700 bg-sage-50 shadow-sm"
          : "border-sage-100 bg-white/80 hover:border-sage-200"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <span className="flex items-center gap-2">
        <input
          type="radio"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onSelect}
          className="h-4 w-4 accent-sage-800"
        />
        <span className="text-sm font-semibold text-sage-900">{label}</span>
      </span>
      <span className="pl-6 text-xs leading-5 text-sage-500">{description}</span>
    </label>
  );
}

export function formatRecipientLabel(user: GiftRecipientOption): string {
  const name = [user.name, user.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();
  return name.length > 0 ? name : user.email;
}
