"use client";

import { useTranslations } from "next-intl";
import { AdminSessionAddRegistrationSearch } from "@/components/admin/admin-session-add-registration-search";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { useAdminSessionAddRegistration } from "@/components/admin/use-admin-session-add-registration";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { PlusIcon } from "@/components/ui/plus-icon";
import { userDisplayName } from "@/lib/user-display-name";

type AdminSessionAddRegistrationProps = {
  sessionId: string;
  startsAt: string;
  booked: number;
  capacity: number;
  registeredUserIds: ReadonlySet<string>;
  onAdded: () => void;
};

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
  const tClasses = useTranslations("adminPages.classes");
  const add = useAdminSessionAddRegistration({
    sessionId,
    startsAt,
    booked,
    capacity,
    onAdded,
    noPackageMessage: tClients("bookings.packagesEmptyRequired"),
    fallbackError: tClients("bookings.createError"),
    searchError: t("addSearchError"),
    successMessage: tClients("bookings.createSuccess"),
  });

  if (!add.canAdd) {
    return add.isFull ? <p className="text-sm text-sage-600">{t("addSessionFull")}</p> : null;
  }

  return (
    <SessionAddRegistrationPanel
      add={add}
      registeredUserIds={registeredUserIds}
      t={t}
      tClasses={tClasses}
    />
  );
}

function SessionAddRegistrationPanel({
  add,
  registeredUserIds,
  t,
  tClasses,
}: {
  add: ReturnType<typeof useAdminSessionAddRegistration>;
  registeredUserIds: ReadonlySet<string>;
  t: ReturnType<typeof useTranslations<"adminPages.classes.registrationsModal">>;
  tClasses: ReturnType<typeof useTranslations<"adminPages.classes">>;
}) {
  return (
    <>
      {add.toast ? (
        <AdminCenterToast
          message={add.toast.message}
          tone={add.toast.tone}
          onDismiss={add.dismissToast}
        />
      ) : null}
      <SessionAddOpenControls add={add} registeredUserIds={registeredUserIds} t={t} />
      <AddStartedVisitConfirm
        client={add.pendingClient}
        pending={add.busyId !== null}
        onConfirm={add.confirmPendingAdd}
        onCancel={add.cancelPendingAdd}
        title={t("addStartedConfirmTitle")}
        description={startedConfirmDescription(t, add.pendingClient)}
        confirm={
          add.busyId !== null ? tClasses("savingButton") : t("addStartedConfirmLabel")
        }
        cancel={tClasses("confirmDialogNo")}
        backdrop={tClasses("confirmDialogBackdrop")}
      />
    </>
  );
}

function SessionAddOpenControls({
  add,
  registeredUserIds,
  t,
}: {
  add: ReturnType<typeof useAdminSessionAddRegistration>;
  registeredUserIds: ReadonlySet<string>;
  t: ReturnType<typeof useTranslations<"adminPages.classes.registrationsModal">>;
}) {
  if (!add.open) {
    return (
      <OmmButton
        type="button"
        variant="primary"
        size="sm"
        className="gap-1.5"
        onClick={() => add.setOpen(true)}
      >
        <PlusIcon className="h-4 w-4 shrink-0" />
        {t("addButton")}
      </OmmButton>
    );
  }
  return (
    <AdminSessionAddRegistrationSearch
      query={add.query}
      onQueryChange={add.setQuery}
      onClose={add.closeSearch}
      searchReady={add.searchKey.length > 0}
      loading={
        add.searchKey.length > 0 && (add.search === null || add.search.key !== add.searchKey)
      }
      error={add.search?.key === add.searchKey ? add.search.error : null}
      rows={add.search?.key === add.searchKey ? add.search.rows : []}
      registeredUserIds={registeredUserIds}
      busyId={add.busyId}
      onSelect={add.requestAdd}
      labels={{
        searchLabel: t("addSearchLabel"),
        searchPlaceholder: t("addSearchPlaceholder"),
        cancel: t("addCancel"),
        hint: t("addSearchHint"),
        loading: t("addSearchLoading"),
        empty: t("addSearchEmpty"),
      }}
    />
  );
}

function startedConfirmDescription(
  t: ReturnType<typeof useTranslations<"adminPages.classes.registrationsModal">>,
  client: ClientRow | null,
): string {
  if (client === null) {
    return "";
  }
  return t("addStartedConfirmDescription", {
    name: userDisplayName(client.name, client.lastName, client.email),
  });
}

function AddStartedVisitConfirm({
  client,
  pending,
  onConfirm,
  onCancel,
  title,
  description,
  confirm,
  cancel,
  backdrop,
}: {
  client: ClientRow | null;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirm: string;
  cancel: string;
  backdrop: string;
}) {
  return (
    <OmmConfirmDialog
      isOpen={client !== null}
      title={title}
      description={description}
      confirmLabel={confirm}
      cancelLabel={cancel}
      backdropAriaLabel={backdrop}
      tone="warm"
      forceCenteredModal
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
