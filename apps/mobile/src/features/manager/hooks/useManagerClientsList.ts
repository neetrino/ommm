import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchManagerClientsList,
  MANAGER_CLIENTS_PAGE_SIZE,
  type ManagerClientListRow,
} from "../../../lib/api/clientsAdminClient";

const SEARCH_DEBOUNCE_MS = 300;

export type ManagerClientsListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      rows: ManagerClientListRow[];
      total: number;
      loadingMore: boolean;
    };

export function useManagerClientsList() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [state, setState] = useState<ManagerClientsListState>({ status: "loading" });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (offset: number, append: boolean) => {
      const requestId = ++requestIdRef.current;
      if (!append) {
        setState({ status: "loading" });
      } else {
        setState((prev) =>
          prev.status === "ready" ? { ...prev, loadingMore: true } : prev,
        );
      }

      try {
        const payload = await fetchManagerClientsList({
          search: debouncedSearch,
          take: MANAGER_CLIENTS_PAGE_SIZE,
          offset,
        });
        if (requestId !== requestIdRef.current) {
          return;
        }
        setState((prev) => {
          const previousRows =
            append && prev.status === "ready" ? prev.rows : [];
          return {
            status: "ready",
            rows: append ? [...previousRows, ...payload.rows] : payload.rows,
            total: payload.pagination.total,
            loadingMore: false,
          };
        });
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load clients",
        });
      }
    },
    [debouncedSearch],
  );

  useEffect(() => {
    void loadPage(0, false);
  }, [loadPage]);

  const reload = useCallback(() => {
    void loadPage(0, false);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (state.status !== "ready" || state.loadingMore) {
      return;
    }
    if (state.rows.length >= state.total) {
      return;
    }
    void loadPage(state.rows.length, true);
  }, [loadPage, state]);

  return {
    searchInput,
    setSearchInput,
    state,
    reload,
    loadMore,
  };
}
