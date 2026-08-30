"use client";

import { AdminSessionAddRegistrationResults } from "@/components/admin/admin-session-add-registration-results";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { OmmButton } from "@/components/ui/omm-button";

const SEARCH_INPUT_CLASS =
  "ommm-input h-11 w-full rounded-2xl border-sand-200/80 bg-white px-3.5 text-sm";

type AdminSessionAddRegistrationSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  searchReady: boolean;
  loading: boolean;
  error: string | null;
  rows: readonly ClientRow[];
  registeredUserIds: ReadonlySet<string>;
  busyId: string | null;
  onSelect: (client: ClientRow) => void;
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    cancel: string;
    hint: string;
    loading: string;
    empty: string;
  };
};

export function AdminSessionAddRegistrationSearch({
  query,
  onQueryChange,
  onClose,
  searchReady,
  loading,
  error,
  rows,
  registeredUserIds,
  busyId,
  onSelect,
  labels,
}: AdminSessionAddRegistrationSearchProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-500">
          {labels.searchLabel}
        </p>
        <OmmButton
          type="button"
          variant="ghost"
          size="sm"
          disabled={busyId !== null}
          onClick={onClose}
        >
          {labels.cancel}
        </OmmButton>
      </div>
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchLabel}
        autoFocus
        disabled={busyId !== null}
        className={SEARCH_INPUT_CLASS}
      />
      <SearchStatus
        queryReady={searchReady}
        loading={loading}
        error={error}
        empty={searchReady && !loading && error === null && rows.length === 0}
        hint={labels.hint}
        loadingLabel={labels.loading}
        emptyLabel={labels.empty}
      />
      {rows.length > 0 ? (
        <AdminSessionAddRegistrationResults
          rows={rows}
          registeredUserIds={registeredUserIds}
          busyId={busyId}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  );
}

function SearchStatus(props: {
  queryReady: boolean;
  loading: boolean;
  error: string | null;
  empty: boolean;
  hint: string;
  loadingLabel: string;
  emptyLabel: string;
}) {
  if (!props.queryReady) {
    return <p className="text-sm text-sage-500">{props.hint}</p>;
  }
  if (props.loading) {
    return <p className="text-sm text-sage-500">{props.loadingLabel}</p>;
  }
  if (props.error !== null) {
    return (
      <p className="text-sm text-rose-700" role="alert">
        {props.error}
      </p>
    );
  }
  if (props.empty) {
    return <p className="text-sm text-sage-500">{props.emptyLabel}</p>;
  }
  return null;
}
