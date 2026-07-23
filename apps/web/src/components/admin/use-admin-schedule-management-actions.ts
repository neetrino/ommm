import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Dispatch, SetStateAction } from "react";
import type {
  AdminScheduleClassType,
  AdminScheduleSession,
  ScheduleToast,
} from "@/components/admin/admin-schedule-session.types";
import { ApiError, apiFetch } from "@/lib/api";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";

type SessionModalConfig = {
  mode: "create" | "duplicate";
  row?: AdminScheduleSession;
} | null;

type UseAdminScheduleManagementActionsParams = {
  t: (key: string) => string;
  router: AppRouterInstance;
  setRows: Dispatch<SetStateAction<AdminScheduleSession[]>>;
  setClassTypes: Dispatch<SetStateAction<AdminScheduleClassType[]>>;
  classTypes: AdminScheduleClassType[];
  setBusyId: Dispatch<SetStateAction<string | null>>;
  setToast: Dispatch<SetStateAction<ScheduleToast | null>>;
  setDetails: Dispatch<SetStateAction<AdminScheduleSession | null>>;
  setEditing: Dispatch<SetStateAction<AdminScheduleSession | null>>;
  addClassOpen: boolean;
  closeAddClassModal: () => void;
  sessionModalConfig: SessionModalConfig;
};

export function useAdminScheduleManagementActions({
  t,
  router,
  setRows,
  setClassTypes,
  classTypes,
  setBusyId,
  setToast,
  setDetails,
  setEditing,
  addClassOpen,
  closeAddClassModal,
  sessionModalConfig,
}: UseAdminScheduleManagementActionsParams) {
  async function runRowAction(
    row: AdminScheduleSession,
    action: () => Promise<AdminScheduleSession | void>,
    ok: string,
  ) {
    setBusyId(row.id);
    setToast(null);
    try {
      const updated = await action();
      if (updated) {
        setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
      setToast({ tone: "ok", message: ok });
      router.refresh();
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("messages.genericError"),
      });
    } finally {
      setBusyId(null);
    }
  }

  function handleCancel(row: AdminScheduleSession) {
    void runRowAction(
      row,
      () =>
        apiFetch(`/classes/sessions/${row.id}/status`, {
          method: "POST",
          body: JSON.stringify({ status: "CANCELLED" }),
        }),
      t("messages.cancelSuccess"),
    );
  }

  function handleActivate(row: AdminScheduleSession) {
    void runRowAction(
      row,
      () =>
        apiFetch(`/classes/sessions/${row.id}/status`, {
          method: "POST",
          body: JSON.stringify({ status: "ACTIVE" }),
        }),
      t("messages.activateSuccess"),
    );
  }

  function handleDelete(row: AdminScheduleSession) {
    void runRowAction(
      row,
      async () => {
        await apiFetch(`/classes/sessions/${row.id}`, { method: "DELETE" });
        setRows((current) => current.filter((item) => item.id !== row.id));
      },
      t("messages.deleteSuccess"),
    );
  }

  function handleDeleteFromDetails(row: AdminScheduleSession) {
    void runRowAction(
      row,
      async () => {
        await apiFetch(`/classes/sessions/${row.id}`, { method: "DELETE" });
        setRows((current) => current.filter((item) => item.id !== row.id));
        setDetails(null);
      },
      t("messages.deleteSuccess"),
    );
  }

  function handleDuplicate(row: AdminScheduleSession) {
    setEditing({ ...row, id: "" });
  }

  function handleDuplicateFromDetails(row: AdminScheduleSession) {
    setDetails(null);
    setEditing({ ...row, id: "" });
  }

  function handleDetailsSaved(saved: AdminScheduleSession) {
    setRows((current) =>
      current
        .map((item) => (item.id === saved.id ? saved : item))
        .sort((first, second) => first.startsAt.localeCompare(second.startsAt)),
    );
    setDetails(saved);
  }

  function handleFormClose() {
    if (addClassOpen) {
      closeAddClassModal();
      return;
    }
    setEditing(null);
  }

  function handleFormSaved(saved: AdminScheduleSession | AdminScheduleSession[]) {
    const savedRows = Array.isArray(saved) ? saved : [saved];
    const createdClassTypes = savedRows
      .map((row) => row.classType)
      .filter((type) => !classTypes.some((item) => item.id === type.id));
    if (createdClassTypes.length > 0) {
      setClassTypes((current) => {
        const byId = new Map(current.map((type) => [type.id, type]));
        for (const type of createdClassTypes) {
          byId.set(type.id, {
            id: type.id,
            name: type.name,
            slug: buildClassTypeSlugFromName(type.name),
          });
        }
        return Array.from(byId.values()).sort((first, second) =>
          first.name.localeCompare(second.name),
        );
      });
    }
    setRows((current) => {
      const byId = new Map(current.map((row) => [row.id, row]));
      for (const savedRow of savedRows) {
        byId.set(savedRow.id, savedRow);
      }
      return Array.from(byId.values()).sort((first, second) =>
        first.startsAt.localeCompare(second.startsAt),
      );
    });
    setToast({
      tone: "ok",
      message:
        sessionModalConfig?.mode === "create"
          ? t("messages.createSuccess")
          : sessionModalConfig?.mode === "duplicate"
            ? t("messages.duplicateSuccess")
            : t("messages.updateSuccess"),
    });
    if (addClassOpen) {
      closeAddClassModal();
    } else {
      setEditing(null);
    }
    router.refresh();
  }

  return {
    handleCancel,
    handleActivate,
    handleDelete,
    handleDeleteFromDetails,
    handleDuplicate,
    handleDuplicateFromDetails,
    handleDetailsSaved,
    handleFormClose,
    handleFormSaved,
  };
}
