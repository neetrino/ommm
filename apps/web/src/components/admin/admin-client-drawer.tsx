"use client";

import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { formatIsoDateToUi } from "@/lib/date-display";
import { AdminClientStatusAction } from "@/components/admin/admin-client-status-action";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import { useClientEditForm } from "@/components/admin/admin-client-edit-form.use";
import type { ClientEditInitialValues } from "@/components/admin/admin-client-edit-form.types";
import {
  replaceAdminClientsSearchParams,
} from "@/components/admin/admin-clients-query";
import {
  CLIENT_ADD_PACKAGE_QUERY_KEY,
  CLIENT_ADD_PACKAGE_QUERY_VALUE,
  CLIENT_PROFILE_TAB_QUERY_KEY,
  CLIENT_SHEET_TAB_ORDER,
  CLIENT_SHEET_TAB_PACKAGES,
  CLIENT_SHEET_TAB_PROFILE,
  parseClientSheetTabId,
  type ClientSheetTabId,
} from "@/components/admin/admin-client-sheet-tabs";
import { ClientSheetTabPanels } from "@/components/admin/admin-client-sheet-tab-panels";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS,
  ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { ClientDetail, ClientRow } from "@/components/admin/admin-clients-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmDrawerPortal, OMM_DRAWER_NESTED_BACKDROP_CLASS } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";
import type { ClientCapabilities } from "@/lib/backoffice-capabilities";
import { usePathname, useRouter } from "@/i18n/navigation";

type AdminClientDrawerProps = {
  client: ClientRow | null;
  locale: string;
  onClose: () => void;
  onChanged: () => void;
  /** Stack above nested confirm dialogs (e.g. package delete modal). */
  useOverlayPortalRoot?: boolean;
  /** Skip the initial profile fetch when the caller already loaded it. */
  initialDetail?: ClientDetail | null;
  /** Admin-only package purchase in Packages tab. */
  allowPackagePurchase?: boolean;
  /** Admin/manager create booking in Bookings tab. */
  allowCreateBooking?: boolean;
  /** Admin/manager cancel booking in Bookings tab history. */
  allowCancelBooking?: boolean;
  capabilities?: ClientCapabilities;
};

function clientHeaderName(client: ClientRow): string {
  const fullName = [client.name, client.lastName].filter(Boolean).join(" ").trim();
  return fullName.length > 0 ? fullName : "—";
}

function clientInitialValues(detail: ClientDetail): ClientEditInitialValues {
  return {
    email: detail.email,
    name: detail.name ?? "",
    lastName: detail.lastName ?? "",
    phone: detail.phone ?? "",
    dateOfBirth: detail.dateOfBirth ? formatIsoDateToUi(detail.dateOfBirth) : "",
  };
}

export function AdminClientDrawer({
  client,
  locale,
  onClose,
  onChanged,
  useOverlayPortalRoot = false,
  initialDetail = null,
  allowPackagePurchase = false,
  allowCreateBooking = false,
  allowCancelBooking = false,
  capabilities,
}: AdminClientDrawerProps) {
  if (client === null) {
    return null;
  }

  return (
    <AdminClientDrawerInner
      key={client.id}
      client={client}
      locale={locale}
      onClose={onClose}
      onChanged={onChanged}
      useOverlayPortalRoot={useOverlayPortalRoot}
      initialDetail={initialDetail}
      allowPackagePurchase={
        capabilities?.canAssignPackage ?? allowPackagePurchase
      }
      allowCreateBooking={
        capabilities?.canCreateBooking ?? allowCreateBooking
      }
      allowCancelBooking={
        capabilities?.canCancelBooking ?? allowCancelBooking
      }
      canAddNotes={capabilities?.canAddNotes ?? true}
      canUpdate={capabilities?.canUpdate ?? true}
    />
  );
}

function AdminClientDrawerInner({
  client,
  locale,
  onClose,
  onChanged,
  useOverlayPortalRoot = false,
  initialDetail = null,
  allowPackagePurchase = false,
  allowCreateBooking = false,
  allowCancelBooking = false,
  canAddNotes = true,
  canUpdate = true,
}: {
  client: ClientRow;
  locale: string;
  onClose: () => void;
  onChanged: () => void;
  useOverlayPortalRoot?: boolean;
  initialDetail?: ClientDetail | null;
  allowPackagePurchase?: boolean;
  allowCreateBooking?: boolean;
  allowCancelBooking?: boolean;
  canAddNotes?: boolean;
  canUpdate?: boolean;
}) {
  const t = useTranslations("adminPages.clients");
  const tAuth = useTranslations("auth.register");
  const titleId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addPackageFromUrl =
    searchParams.get(CLIENT_ADD_PACKAGE_QUERY_KEY) === CLIENT_ADD_PACKAGE_QUERY_VALUE;
  const urlTab = addPackageFromUrl
    ? CLIENT_SHEET_TAB_PACKAGES
    : parseClientSheetTabId(searchParams.get(CLIENT_PROFILE_TAB_QUERY_KEY));
  const [activeTab, setActiveTab] = useState<ClientSheetTabId>(urlTab);
  const [prevUrlTab, setPrevUrlTab] = useState(urlTab);
  if (urlTab !== prevUrlTab) {
    setPrevUrlTab(urlTab);
    setActiveTab(urlTab);
  }
  const matchingInitialDetail =
    initialDetail !== null && initialDetail.id === client.id ? initialDetail : null;
  const [detail, setDetail] = useState<ClientDetail | null>(matchingInitialDetail);
  const [loading, setLoading] = useState(matchingInitialDetail === null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<"ok" | "err">("ok");
  const [note, setNote] = useState("");
  const [giftAmount, setGiftAmount] = useState("10000");
  const [tabRefreshKey, setTabRefreshKey] = useState(0);
  const [personalInfoEditing, setPersonalInfoEditing] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

  const refreshDetail = useCallback(async () => {
    const fresh = await apiFetch<ClientDetail>(`/clients/${client.id}`);
    setDetail(fresh);
    setTabRefreshKey((current) => current + 1);
    return fresh;
  }, [client.id]);

  useEffect(() => {
    if (matchingInitialDetail !== null) {
      return undefined;
    }

    let cancelled = false;
    void apiFetch<ClientDetail>(`/clients/${client.id}`)
      .then((payload) => {
        if (!cancelled) {
          setDetail(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client.id, matchingInitialDetail]);

  const initial = useMemo(
    () => (detail ? clientInitialValues(detail) : null),
    [detail],
  );

  const validationLabels = useMemo(
    () => ({
      emailRequired: t("emailRequired"),
      emailInvalid: t("emailInvalid"),
      birthdayInvalid: t("birthdayInvalid"),
      phoneInvalid: tAuth("invalidPhone"),
    }),
    [t, tAuth],
  );

  const fallbackInitial = useMemo<ClientEditInitialValues>(
    () => ({
      email: client.email,
      name: client.name ?? "",
      lastName: client.lastName ?? "",
      phone: client.phone ?? "",
      dateOfBirth: client.dateOfBirth ? formatIsoDateToUi(client.dateOfBirth) : "",
    }),
    [client.dateOfBirth, client.email, client.lastName, client.name, client.phone],
  );

  const editForm = useClientEditForm({
    clientId: client.id,
    resetKey: detail
      ? `${client.id}:${detail.email}:${detail.phone}:${detail.dateOfBirth ?? ""}`
      : client.id,
    initial: initial ?? fallbackInitial,
    labels: validationLabels,
    onSaved: () => {
      void refreshDetail();
      onChanged();
    },
  });

  const tabs = CLIENT_SHEET_TAB_ORDER.map((value) => ({
    value,
    label: t(`sheetTabs.${value}`),
  }));

  const statusLabels = useMemo(
    () => ({
      activate: t("activateClient"),
      deactivate: t("deactivateClient"),
      saving: t("savingButton"),
      confirmActivate: t("confirmActivate"),
      confirmDeactivate: t("confirmDeactivate"),
      activated: t("activateSuccess"),
      deactivated: t("deactivateSuccess"),
      failed: t("genericError"),
    }),
    [t],
  );

  const sheetBusy = editForm.busy || statusBusy || actionBusy !== null;

  const updateClientTabQuery = useCallback(
    (tab: ClientSheetTabId) => {
      replaceAdminClientsSearchParams(pathname, router, (params) => {
        if (tab === CLIENT_SHEET_TAB_PROFILE) {
          params.delete(CLIENT_PROFILE_TAB_QUERY_KEY);
        } else {
          params.set(CLIENT_PROFILE_TAB_QUERY_KEY, tab);
        }
        if (tab !== CLIENT_SHEET_TAB_PACKAGES) {
          params.delete(CLIENT_ADD_PACKAGE_QUERY_KEY);
        }
      });
    },
    [pathname, router],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = parseClientSheetTabId(value);
      setActiveTab(tab);
      updateClientTabQuery(tab);
    },
    [updateClientTabQuery],
  );

  function handleClose(): void {
    if (sheetBusy) {
      return;
    }
    setPersonalInfoEditing(false);
    replaceAdminClientsSearchParams(pathname, router, (params) => {
      params.delete(CLIENT_PROFILE_TAB_QUERY_KEY);
      params.delete(CLIENT_ADD_PACKAGE_QUERY_KEY);
    });
    onClose();
  }

  function handleCancelPersonalInfoEdit(): void {
    editForm.cancelEdits();
    setPersonalInfoEditing(false);
  }

  async function handleSavePersonalInfo(): Promise<void> {
    const saved = await editForm.save(t("updateSuccess"), t("genericError"));
    if (saved) {
      setPersonalInfoEditing(false);
      onClose();
    }
  }

  function handlePersonalInfoFormSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleSavePersonalInfo();
  }

  async function runAction(
    key: string,
    action: () => Promise<void>,
    ok: string,
  ): Promise<void> {
    if (actionBusy !== null) {
      return;
    }
    setActionBusy(key);
    setActionMessage(null);
    try {
      await action();
      setActionTone("ok");
      setActionMessage(ok);
      onChanged();
      await refreshDetail();
      if (key === "note") {
        setNote("");
      }
    } catch (error) {
      setActionTone("err");
      setActionMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setActionBusy(null);
    }
  }

  const toastMessage =
    editForm.message ?? statusNotice?.message ?? actionMessage ?? null;
  const toastTone = editForm.message
    ? editForm.messageTone
    : statusNotice?.tone ?? actionTone;

  const isActive = !(detail?.activity.isBlocked ?? client.isBlocked);
  const isNestedOverlay = useOverlayPortalRoot;
  const bodyClassName = isNestedOverlay
    ? `${ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`
    : `${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`;

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={sheetBusy}
      closeOnEscape={!avatarPreviewOpen}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={
        isNestedOverlay ? ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS : ADMIN_WIDE_DRAWER_PANEL_CLASS
      }
      backdropClassName={isNestedOverlay ? OMM_DRAWER_NESTED_BACKDROP_CLASS : undefined}
      lockBodyScroll={!isNestedOverlay}
      useOverlayPortalRoot={useOverlayPortalRoot}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {clientHeaderName(client)}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <AdminClientStatusAction
              clientId={client.id}
              isActive={isActive}
              labels={statusLabels}
              layout="inline"
              disabled={editForm.busy || loading}
              onBusyChange={setStatusBusy}
              onStatusMessage={(message, tone) => setStatusNotice({ message, tone })}
              onChanged={() => {
                void refreshDetail();
                onChanged();
              }}
            />
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
              aria-label={t("modalCloseAria")}
              disabled={sheetBusy}
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className={bodyClassName}>
        {toastMessage ? (
          <AdminCenterToast
            message={toastMessage}
            tone={toastTone}
            onDismiss={() => {
              editForm.clearMessage();
              setStatusNotice(null);
              setActionMessage(null);
            }}
          />
        ) : null}

        {loading || !detail || !initial ? (
          <p className="text-sm text-sage-600">
            {loading ? t("drawer.loading") : t("drawer.unavailable")}
          </p>
        ) : (
          <ClientSheetTabPanels
            activeTab={activeTab}
            locale={locale}
            detail={detail}
            form={editForm.form}
            errors={editForm.errors}
            busy={editForm.busy}
            controller={editForm}
            giftAmount={giftAmount}
            note={note}
            actionBusy={actionBusy}
            onGiftAmountChange={setGiftAmount}
            onNoteChange={setNote}
            onRun={runAction}
            tabRefreshKey={tabRefreshKey}
            personalInfoEditing={canUpdate && personalInfoEditing}
            onStartPersonalInfoEdit={
              canUpdate ? () => setPersonalInfoEditing(true) : () => undefined
            }
            onPersonalInfoSubmit={handlePersonalInfoFormSubmit}
            onAvatarPreviewOpenChange={setAvatarPreviewOpen}
            allowPackagePurchase={allowPackagePurchase}
            allowCreateBooking={allowCreateBooking}
            allowCancelBooking={allowCancelBooking}
            canAddNotes={canAddNotes}
            onPackagePurchaseSuccess={() => {
              setActionTone("ok");
              setActionMessage(t("packages.purchaseSuccess"));
              onChanged();
              void refreshDetail();
            }}
            onBookingCreateSuccess={() => {
              setActionTone("ok");
              setActionMessage(t("bookings.createSuccess"));
              onChanged();
              void refreshDetail();
            }}
            onBookingCancelSuccess={() => {
              setActionTone("ok");
              setActionMessage(t("bookings.cancelSuccess"));
              onChanged();
              void refreshDetail();
            }}
            onBookingCancelError={(message) => {
              setActionTone("err");
              setActionMessage(message);
            }}
          />
        )}
      </div>

      <AdminDetailSheetFormFooter
        saveLabel={t("saveButton")}
        cancelLabel={t("cancelButton")}
        savingLabel={t("savingButton")}
        dirty={editForm.dirty || personalInfoEditing}
        busy={editForm.busy}
        onCancel={handleCancelPersonalInfoEdit}
        onSave={() => {
          void handleSavePersonalInfo();
        }}
      />
    </OmmDrawerPortal>
  );
}
