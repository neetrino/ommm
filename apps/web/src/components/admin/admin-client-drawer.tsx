"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatIsoDateToUi } from "@/lib/date-display";
import { AdminClientStatusAction } from "@/components/admin/admin-client-status-action";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import { useClientEditForm } from "@/components/admin/admin-client-edit-form.use";
import type { ClientEditInitialValues } from "@/components/admin/admin-client-edit-form.types";
import {
  CLIENT_SHEET_TAB_ORDER,
  CLIENT_SHEET_TAB_PROFILE,
  type ClientSheetTabId,
} from "@/components/admin/admin-client-sheet-tabs";
import { ClientSheetTabPanels } from "@/components/admin/admin-client-sheet-tab-panels";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { ClientDetail, ClientRow } from "@/components/admin/admin-clients-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";

type AdminClientDrawerProps = {
  client: ClientRow | null;
  locale: string;
  onClose: () => void;
  onChanged: () => void;
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

export function AdminClientDrawer({ client, locale, onClose, onChanged }: AdminClientDrawerProps) {
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
    />
  );
}

function AdminClientDrawerInner({
  client,
  locale,
  onClose,
  onChanged,
}: {
  client: ClientRow;
  locale: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const t = useTranslations("adminPages.clients");
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<ClientSheetTabId>(CLIENT_SHEET_TAB_PROFILE);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
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

  const refreshDetail = useCallback(async () => {
    const fresh = await apiFetch<ClientDetail>(`/clients/${client.id}`);
    setDetail(fresh);
    setTabRefreshKey((current) => current + 1);
    return fresh;
  }, [client.id]);

  useEffect(() => {
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
  }, [client.id]);

  const initial = useMemo(
    () => (detail ? clientInitialValues(detail) : null),
    [detail],
  );

  const validationLabels = useMemo(
    () => ({
      emailRequired: t("emailRequired"),
      emailInvalid: t("emailInvalid"),
      birthdayInvalid: t("birthdayInvalid"),
    }),
    [t],
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

  function handleClose(): void {
    if (sheetBusy) {
      return;
    }
    onClose();
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

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={sheetBusy}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {clientHeaderName(client)}
          </h2>
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
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as ClientSheetTabId)}
      />

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
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
          />
        )}
      </div>

      <AdminDetailSheetFormFooter
        saveLabel={t("saveButton")}
        cancelLabel={t("cancelButton")}
        savingLabel={t("savingButton")}
        dirty={editForm.dirty}
        busy={editForm.busy}
        onCancel={editForm.cancelEdits}
        onSave={() => {
          void editForm.save(t("updateSuccess"), t("genericError"));
        }}
      />
    </OmmDrawerPortal>
  );
}
