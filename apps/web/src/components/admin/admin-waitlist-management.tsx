"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminWaitlistCompactRow } from "@/components/admin/admin-waitlist-compact-row";
import {
  ADMIN_WAITLIST_LIST_ACTIONS_HEADER_CELL,
  ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER,
  ADMIN_WAITLIST_LIST_HEADER_CLASS,
  ADMIN_WAITLIST_LIST_TABLE_CLASS,
} from "@/components/admin/admin-waitlist-list-layout";
import {
  buildAdminWaitlistActiveEndpoint,
  type AdminWaitlistActivePayload,
  type AdminWaitlistRow,
} from "@/components/admin/admin-waitlist-query";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminUserDetailsDrawer } from "@/components/admin/admin-user-details-drawer";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { usePathname, useRouter } from "@/i18n/navigation";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

type ToastTone = "ok" | "err";

type AdminWaitlistManagementProps = {
  locale: string;
  initial: AdminWaitlistActivePayload;
  initialLoadError: string | null;
};

function toUserLabel(name: string | null, lastName: string | null, email: string): string {
  const full = [name, lastName].filter((part) => part && part.trim().length > 0).join(" ");
  return full.length > 0 ? full : email;
}

export function AdminWaitlistManagement({
  locale,
  initial,
  initialLoadError,
}: AdminWaitlistManagementProps) {
  const t = useTranslations("adminPages.waitlists");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<AdminWaitlistRow | null>(null);
  const [, startRefreshTransition] = useTransition();
  const refreshRequestId = useRef(0);

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  useEffect(() => {
    setPayload(initial);
  }, [initial]);

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize);
      });
    },
    [replaceSearchParams],
  );

  const loadRows = useCallback(async () => {
    const requestId = ++refreshRequestId.current;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiFetch<AdminWaitlistActivePayload>(
        buildAdminWaitlistActiveEndpoint(listPage.take, listPage.offset),
      );
      if (requestId !== refreshRequestId.current) {
        return;
      }
      setPayload(data);
    } catch (error) {
      if (requestId !== refreshRequestId.current) {
        return;
      }
      setLoadError(error instanceof ApiError ? error.message : t("loadFailed"));
    } finally {
      if (requestId === refreshRequestId.current) {
        setLoading(false);
      }
    }
  }, [listPage.offset, listPage.take, t]);

  const refreshList = useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router, startRefreshTransition]);

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
      refreshList();
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("actionFailed"),
      });
    } finally {
      setBusyAction(null);
    }
  }

  const rows = payload.items;
  const hasRows = rows.length > 0;

  const closeRemoveConfirm = useCallback(() => {
    setPendingRemove(null);
  }, []);

  useCloseOnEscape(pendingRemove !== null, closeRemoveConfirm, {
    disabled: busyAction !== null,
  });

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
        <div className={ADMIN_WAITLIST_LIST_TABLE_CLASS}>
          <div className={ADMIN_WAITLIST_LIST_HEADER_CLASS}>
            <span>{t("colUser")}</span>
            <span className={ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER}>{t("colClassType")}</span>
            <span className={`${ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER} md:text-center`}>
              {t("colWaitlistCount")}
            </span>
            <span className={`${ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER} md:text-center`}>
              {t("colWaitlistDate")}
            </span>
            <span aria-hidden="true" />
            <span className={ADMIN_WAITLIST_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
          </div>
          {rows.map((row) => {
            const rowBusy = busyAction?.startsWith(`${row.id}:`) ?? false;
            const userLabel = toUserLabel(row.user.name, row.user.lastName, row.user.email);
            return (
              <AdminWaitlistCompactRow
                key={row.id}
                locale={locale}
                row={row}
                rowBusy={rowBusy}
                userLabel={userLabel}
                onOpenUser={setSelectedUserId}
                onPromote={() =>
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
                onNotify={() =>
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
                onRemove={() => setPendingRemove(row)}
              />
            );
          })}
          <OmmListPagination
            total={payload.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={payload.offset}
            onPageChange={setListPage}
            onPageSizeChange={(pageSize) => setListPage(1, pageSize)}
            disabled={loading || busyAction !== null}
          />
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
