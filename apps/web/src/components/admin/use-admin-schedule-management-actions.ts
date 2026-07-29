import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Dispatch, SetStateAction } from "react";
import type {
  AdminScheduleClassType,
  AdminScheduleSession,
  ScheduleToast,
} from "@/components/admin/admin-schedule-session.types";
import { ApiError, apiFetch } from "@/lib/api";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";

export const ADMIN_SCHEDULE_BULK_BUSY_ID = "__bulk__";

type SessionModalConfig = {
  mode: "create" | "duplicate";
  row?: AdminScheduleSession;
} | null;

type UseAdminScheduleManagementActionsParams = {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
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
  clearSelection: () => void;
};

async function postSessionStatus(
  sessionId: string,
  status: "ACTIVE" | "CANCELLED",
): Promise<AdminScheduleSession> {
  return apiFetch<AdminScheduleSession>(`/classes/sessions/${sessionId}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

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
  clearSelection,
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

  async function runBulkStatusAction(
    targets: AdminScheduleSession[],
    status: "ACTIVE" | "CANCELLED",
    okKey: string,
  ) {
    if (targets.length === 0) {
      return;
    }
    setBusyId(ADMIN_SCHEDULE_BULK_BUSY_ID);
    setToast(null);
    try {
      const results = await Promise.allSettled(
        targets.map((row) => postSessionStatus(row.id, status)),
      );
      const updatedRows: AdminScheduleSession[] = [];
      let failureCount = 0;
      for (const result of results) {
        if (result.status === "fulfilled") {
          updatedRows.push(result.value);
        } else {
          failureCount += 1;
        }
      }
      if (updatedRows.length > 0) {
        const byId = new Map(updatedRows.map((row) => [row.id, row]));
        setRows((current) => current.map((item) => byId.get(item.id) ?? item));
      }
      clearSelection();
      if (failureCount === 0) {
        setToast({
          tone: "ok",
          message: t(okKey, { count: updatedRows.length }),
        });
      } else if (updatedRows.length === 0) {
        setToast({ tone: "err", message: t("messages.genericError") });
      } else {
        setToast({
          tone: "err",
          message: t("bulk.partialFailure", {
            ok: updatedRows.length,
            failed: failureCount,
          }),
        });
      }
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
      () => postSessionStatus(row.id, "CANCELLED"),
      t("messages.cancelSuccess"),
    );
  }

  function handleActivate(row: AdminScheduleSession) {
    void runRowAction(
      row,
      () => postSessionStatus(row.id, "ACTIVE"),
      t("messages.activateSuccess"),
    );
  }

  function handleBulkCancel(rows: AdminScheduleSession[]) {
    const targets = rows.filter((row) => row.status !== "CANCELLED");
    void runBulkStatusAction(targets, "CANCELLED", "bulk.cancelSuccess");
  }

  function handleBulkActivate(rows: AdminScheduleSession[]) {
    const targets = rows.filter((row) => row.status === "CANCELLED");
    void runBulkStatusAction(targets, "ACTIVE", "bulk.activateSuccess");
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
    handleBulkCancel,
    handleBulkActivate,
    handleDelete,
    handleDeleteFromDetails,
    handleDuplicate,
    handleDuplicateFromDetails,
    handleDetailsSaved,
    handleFormClose,
    handleFormSaved,
  };
}
