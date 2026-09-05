"use client";

import { useEffect, useState } from "react";
import { bookClientOnSession } from "@/components/admin/admin-session-add-registration-book";
import {
  buildSessionAddClientSearchUrl,
  canAddVisitorToSession,
  isSearchQueryReady,
  parseClientSearchRows,
  SESSION_ADD_SEARCH_DEBOUNCE_MS,
  shouldAttachVisitorAsPastVisit,
} from "@/components/admin/admin-session-add-registration.helpers";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { ApiError, apiFetch } from "@/lib/api";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";

type SearchState = {
  key: string;
  rows: readonly ClientRow[];
  error: string | null;
};

export type SessionAddToast = { message: string; tone: "ok" | "err" };

type UseAdminSessionAddRegistrationParams = {
  sessionId: string;
  startsAt: string;
  booked: number;
  capacity: number;
  onAdded: () => void;
  noPackageMessage: string;
  fallbackError: string;
  searchError: string;
  successMessage: string;
};

export function useAdminSessionAddRegistration(
  params: UseAdminSessionAddRegistrationParams,
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const search = useSessionAddSearch(query, params.searchError);

  function closePanel(): void {
    setOpen(false);
    setQuery("");
    search.reset();
  }

  const submit = useSessionAddSubmit({
    ...params,
    onAdded: () => {
      closePanel();
      params.onAdded();
    },
  });
  const canAdd = canAddVisitorToSession({
    booked: params.booked,
    capacity: params.capacity,
  });

  return {
    open,
    query,
    setQuery,
    setOpen,
    closeSearch: () => {
      closePanel();
      submit.clearPending();
    },
    canAdd,
    isFull: params.booked >= params.capacity,
    searchKey: search.searchKey,
    search: search.state,
    busyId: submit.busyId,
    pendingClient: submit.pendingClient,
    toast: submit.toast,
    dismissToast: submit.dismissToast,
    requestAdd: submit.requestAdd,
    confirmPendingAdd: submit.confirmPendingAdd,
    cancelPendingAdd: submit.cancelPendingAdd,
  };
}

function useSessionAddSearch(query: string, searchError: string) {
  const [state, setState] = useState<SearchState | null>(null);
  const runSearch = useDebouncedCallback(() => {
    void fetchClientSearch(query, searchError, setState);
  }, SESSION_ADD_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    runSearch();
  }, [query, runSearch]);

  return {
    state,
    searchKey: isSearchQueryReady(query) ? query.trim() : "",
    reset: () => setState(null),
  };
}

function useSessionAddSubmit(params: UseAdminSessionAddRegistrationParams) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingClient, setPendingClient] = useState<ClientRow | null>(null);
  const [toast, setToast] = useState<SessionAddToast | null>(null);
  const attachAsPastVisit = shouldAttachVisitorAsPastVisit(params.startsAt);

  function requestAdd(client: ClientRow): void {
    queueVisitorAdd(client, busyId, attachAsPastVisit, setPendingClient, runSubmitAdd);
  }

  async function runSubmitAdd(client: ClientRow): Promise<void> {
    if (busyId !== null) {
      return;
    }
    setBusyId(client.id);
    setToast(null);
    const result = await submitVisitorBooking(client, params, attachAsPastVisit);
    setBusyId(null);
    if (!result.ok) {
      setToast({ message: result.message, tone: "err" });
      return;
    }
    setToast({ message: params.successMessage, tone: "ok" });
    setPendingClient(null);
    dispatchNotificationsRefresh();
    params.onAdded();
  }

  return {
    busyId,
    pendingClient,
    toast,
    dismissToast: () => setToast(null),
    requestAdd,
    confirmPendingAdd: () => {
      if (pendingClient !== null) {
        void runSubmitAdd(pendingClient);
      }
    },
    cancelPendingAdd: () => {
      if (busyId === null) {
        setPendingClient(null);
      }
    },
    clearPending: () => setPendingClient(null),
  };
}

function queueVisitorAdd(
  client: ClientRow,
  busyId: string | null,
  attachAsPastVisit: boolean,
  setPendingClient: (client: ClientRow) => void,
  runSubmitAdd: (client: ClientRow) => Promise<void>,
): void {
  if (busyId !== null) {
    return;
  }
  if (attachAsPastVisit) {
    setPendingClient(client);
    return;
  }
  void runSubmitAdd(client);
}

async function submitVisitorBooking(
  client: ClientRow,
  params: UseAdminSessionAddRegistrationParams,
  attachAsPastVisit: boolean,
) {
  return bookClientOnSession({
    clientId: client.id,
    sessionId: params.sessionId,
    attachAsPastVisit,
    noPackageMessage: params.noPackageMessage,
    fallbackError: params.fallbackError,
  });
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
