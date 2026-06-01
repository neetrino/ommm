"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminUserDetailsDrawer } from "@/components/admin/admin-user-details-drawer";

type AdminWaitlistRow = {
  id: string;
  status: "ACTIVE" | "OFFERED" | "EXPIRED" | "CONVERTED" | "REMOVED";
  waitlistDate: string;
  sessionWaitlistCount: number;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    classType: { id: string; name: string };
  };
};

type ToastTone = "ok" | "err";

type AdminWaitlistManagementProps = {
  locale: string;
  initialRows: AdminWaitlistRow[];
  initialLoadError: string | null;
};

function UserGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ArrowUpGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

function BellGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function toUserLabel(name: string | null, lastName: string | null, email: string): string {
  const full = [name, lastName].filter((part) => part && part.trim().length > 0).join(" ");
  return full.length > 0 ? full : email;
}

export function AdminWaitlistManagement({
  locale,
  initialRows,
  initialLoadError,
}: AdminWaitlistManagementProps) {
  const t = useTranslations("adminPages.waitlists");
  const [rows, setRows] = useState<AdminWaitlistRow[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<AdminWaitlistRow | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const payload = await apiFetch<AdminWaitlistRow[]>("/waitlist/admin/active?take=250");
      setRows(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  async function runAction(
    row: AdminWaitlistRow,
    actionKey: "promote" | "notify" | "remove",
    run: () => Promise<void>,
    successMessage: string,
  ) {
    const lockKey = `${row.id}:${actionKey}`;
    if (busyAction !== null) {
      return;
    }
    setBusyAction(lockKey);
    setToast(null);
    try {
      await run();
      setToast({ tone: "ok", message: successMessage });
      await loadRows();
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("actionFailed"),
      });
    } finally {
      setBusyAction(null);
    }
  }

  const hasRows = rows.length > 0;

  const confirmRemoveLabel = useMemo(() => {
    if (pendingRemove === null) {
      return "";
    }
    return toUserLabel(
      pendingRemove.user.name,
      pendingRemove.user.lastName,
      pendingRemove.user.email,
    );
  }, [pendingRemove]);

  if (loading) {
    return <div className={adminChrome.panel}>{t("loading")}</div>;
  }

  if (loadError) {
    return (
      <div className={adminChrome.panel}>
        <p className="text-sm text-red-800">{loadError}</p>
        <button type="button" className="ommm-cta-secondary mt-3 h-9 px-4" onClick={() => void loadRows()}>
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <>
      {!hasRows ? (
        <div className={adminChrome.panel}>{t("empty")}</div>
      ) : (
        <div className={adminChrome.tableWrap}>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colUser")}</th>
                <th className={adminChrome.th}>{t("colClassType")}</th>
                <th className={adminChrome.th}>{t("colWaitlistCount")}</th>
                <th className={adminChrome.th}>{t("colWaitlistDate")}</th>
                <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const rowBusy = busyAction?.startsWith(`${row.id}:`) ?? false;
                const userLabel = toUserLabel(row.user.name, row.user.lastName, row.user.email);
                return (
                  <tr key={row.id} className={adminChrome.tr}>
                    <td className={adminChrome.tdStrong}>
                      <button
                        type="button"
                        className="text-left font-medium text-sage-900 underline-offset-2 hover:underline"
                        onClick={() => setSelectedUserId(row.user.id)}
                      >
                        {userLabel}
                      </button>
                      <div className={adminChrome.metaText}>{row.user.phone ?? "—"}</div>
                    </td>
                    <td className={adminChrome.td}>{row.session.classType.name}</td>
                    <td className={adminChrome.td}>{row.sessionWaitlistCount}</td>
                    <td className={adminChrome.td}>
                      {formatDateTimeForUi(row.waitlistDate, locale)}
                    </td>
                    <td className={`${adminChrome.td} text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 transition hover:bg-white disabled:opacity-50"
                          aria-label={t("actions.userDetails")}
                          title={t("actions.userDetails")}
                          onClick={() => setSelectedUserId(row.user.id)}
                          disabled={rowBusy}
                        >
                          <UserGlyph />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          aria-label={t("actions.promote")}
                          title={t("actions.promote")}
                          onClick={() =>
                            void runAction(
                              row,
                              "promote",
                              () =>
                                apiFetch(`/waitlist/entries/${row.id}/promote`, {
                                  method: "POST",
                                  body: JSON.stringify({ targetSessionId: row.session.id }),
                                }),
                              t("successPromote"),
                            )
                          }
                          disabled={rowBusy}
                        >
                          <ArrowUpGlyph />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"
                          aria-label={t("actions.notify")}
                          title={t("actions.notify")}
                          onClick={() =>
                            void runAction(
                              row,
                              "notify",
                              () =>
                                apiFetch(`/waitlist/entries/${row.id}/notify`, {
                                  method: "POST",
                                  body: JSON.stringify({}),
                                }),
                              t("successNotify"),
                            )
                          }
                          disabled={rowBusy}
                        >
                          <BellGlyph />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          aria-label={t("actions.remove")}
                          title={t("actions.remove")}
                          onClick={() => setPendingRemove(row)}
                          disabled={rowBusy}
                        >
                          <TrashGlyph />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast ? (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-[95] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] ${
            toast.tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {pendingRemove ? (
        <div className="ommm-modal-overlay z-[95] items-center p-4" role="presentation">
          <button
            type="button"
            className="ommm-modal-backdrop"
            aria-label={t("removeConfirm.cancel")}
            onClick={() => setPendingRemove(null)}
            disabled={busyAction !== null}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white p-5 shadow-[0_20px_50px_-25px_rgba(45,40,35,0.35)]">
            <h3 className="text-base font-semibold text-sage-900">{t("removeConfirm.title")}</h3>
            <p className="mt-2 text-sm text-sage-700">
              {t("removeConfirm.description", { user: confirmRemoveLabel })}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="ommm-cta-secondary h-9 px-4"
                onClick={() => setPendingRemove(null)}
                disabled={busyAction !== null}
              >
                {t("removeConfirm.cancel")}
              </button>
              <button
                type="button"
                className="ommm-cta-primary h-9 px-4"
                onClick={() => {
                  void runAction(
                    pendingRemove,
                    "remove",
                    () => apiFetch(`/waitlist/entries/${pendingRemove.id}`, { method: "DELETE" }),
                    t("successRemove"),
                  );
                  setPendingRemove(null);
                }}
                disabled={busyAction !== null}
              >
                {t("removeConfirm.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminUserDetailsDrawer
        key={selectedUserId ?? "closed"}
        locale={locale}
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}
