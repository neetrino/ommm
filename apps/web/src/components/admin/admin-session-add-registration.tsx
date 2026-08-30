"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { bookClientOnSession } from "@/components/admin/admin-session-add-registration-book";
import { AdminSessionAddRegistrationSearch } from "@/components/admin/admin-session-add-registration-search";
import {
  buildSessionAddClientSearchUrl,
  canAddVisitorToSession,
  isSearchQueryReady,
  parseClientSearchRows,
  SESSION_ADD_SEARCH_DEBOUNCE_MS,
} from "@/components/admin/admin-session-add-registration.helpers";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { PlusIcon } from "@/components/ui/plus-icon";
import { ApiError, apiFetch } from "@/lib/api";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";

type AdminSessionAddRegistrationProps = {
  sessionId: string;
  startsAt: string;
  booked: number;
  capacity: number;
  registeredUserIds: ReadonlySet<string>;
  onAdded: () => void;
};

type SearchState = {
  key: string;
  rows: readonly ClientRow[];
  error: string | null;
};

type ToastState = { message: string; tone: "ok" | "err" };

export function AdminSessionAddRegistration({
  sessionId,
  startsAt,
  booked,
  capacity,
  registeredUserIds,
  onAdded,
}: AdminSessionAddRegistrationProps) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  const tClients = useTranslations("adminPages.clients");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const canAdd = canAddVisitorToSession({ booked, capacity, startsAt });
  const searchKey = isSearchQueryReady(query) ? query.trim() : "";

  const runSearch = useDebouncedCallback(() => {
    void fetchClientSearch(query, t("addSearchError"), setSearch);
  }, SESSION_ADD_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    runSearch();
  }, [query, runSearch]);

  function closeSearch(): void {
    setOpen(false);
    setQuery("");
    setSearch(null);
  }

  async function handleSelect(client: ClientRow): Promise<void> {
    if (busyId !== null) {
      return;
    }
    setBusyId(client.id);
    setToast(null);
    const result = await bookClientOnSession({
      clientId: client.id,
      sessionId,
      noPackageMessage: tClients("bookings.packagesEmptyRequired"),
      fallbackError: tClients("bookings.createError"),
    });
    setBusyId(null);
    if (!result.ok) {
      setToast({ message: result.message, tone: "err" });
      return;
    }
    setToast({ message: tClients("bookings.createSuccess"), tone: "ok" });
    closeSearch();
    dispatchNotificationsRefresh();
    onAdded();
  }

  if (!canAdd) {
    return booked >= capacity ? (
      <p className="text-sm text-sage-600">{t("addSessionFull")}</p>
    ) : null;
  }

  return (
    <>
      {toast ? (
        <AdminCenterToast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      ) : null}
      {open ? (
        <AdminSessionAddRegistrationSearch
          query={query}
          onQueryChange={setQuery}
          onClose={closeSearch}
          searchReady={searchKey.length > 0}
          loading={searchKey.length > 0 && (search === null || search.key !== searchKey)}
          error={search?.key === searchKey ? search.error : null}
          rows={search?.key === searchKey ? search.rows : []}
          registeredUserIds={registeredUserIds}
          busyId={busyId}
          onSelect={(client) => {
            void handleSelect(client);
          }}
          labels={{
            searchLabel: t("addSearchLabel"),
            searchPlaceholder: t("addSearchPlaceholder"),
            cancel: t("addCancel"),
            hint: t("addSearchHint"),
            loading: t("addSearchLoading"),
            empty: t("addSearchEmpty"),
          }}
        />
      ) : (
        <OmmButton
          type="button"
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() => setOpen(true)}
        >
          <PlusIcon className="h-4 w-4 shrink-0" />
          {t("addButton")}
        </OmmButton>
      )}
    </>
  );
}

async function fetchClientSearch(
  query: string,
  fallbackError: string,
  setSearch: (next: SearchState | null) => void,
): Promise<void> {
  if (!isSearchQueryReady(query)) {
    setSearch(null);
    return;
  }
  const key = query.trim();
  try {
    const payload = await apiFetch<Parameters<typeof parseClientSearchRows>[0]>(
      buildSessionAddClientSearchUrl(key),
    );
    setSearch({ key, rows: parseClientSearchRows(payload), error: null });
  } catch (err) {
    setSearch({
      key,
      rows: [],
      error: err instanceof ApiError ? err.message : fallbackError,
    });
  }
}
