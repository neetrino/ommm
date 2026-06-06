"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClassTypeDeleteAction } from "@/components/admin/admin-class-type-delete-action";
import { useClassTypeEditForm } from "@/components/admin/admin-class-type-edit-form.use";
import {
  classTypeFormFromRow,
  emptyClassTypeForm,
} from "@/components/admin/admin-class-type-edit-form.types";
import { ClassTypeSheetTabPanels } from "@/components/admin/admin-class-type-sheet-tab-panels";
import { AdminClassTypesCatalogPanel } from "@/components/admin/admin-class-types-catalog-panel";
import {
  CLASS_TYPE_SHEET_TAB_DETAILS,
  CLASS_TYPE_SHEET_TAB_ORDER,
  type ClassTypeSheetTabId,
} from "@/components/admin/admin-class-type-sheet-tabs";
import type { AdminClassTypeRow } from "@/components/admin/admin-class-types-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { PlusIcon } from "@/components/ui/plus-icon";
import { ApiError, apiFetch } from "@/lib/api";

export type { AdminClassTypeRow } from "@/components/admin/admin-class-types-types";

type AdminSessionClassTypeRef = {
  classType: { id: string };
};

type SheetView = "catalog" | "create" | "edit";

type AdminClassTypesModalProps = {
  isOpen: boolean;
  classTypes: readonly AdminClassTypeRow[];
  sessionCountByTypeId: Readonly<Record<string, number>>;
  onClose: () => void;
  onChanged: (types: AdminClassTypeRow[]) => void;
  initialSelectedId?: string | null;
  onSelectedTypeIdChange?: (typeId: string | null) => void;
  allowCreate?: boolean;
  allowDelete?: boolean;
};

type LoadState = "idle" | "loading" | "error";

function sortTypes(types: readonly AdminClassTypeRow[]): AdminClassTypeRow[] {
  return [...types].sort((left, right) => left.name.localeCompare(right.name));
}

export function AdminClassTypesModal({
  isOpen,
  classTypes,
  sessionCountByTypeId,
  onClose,
  onChanged,
  initialSelectedId = null,
  onSelectedTypeIdChange,
  allowCreate = true,
  allowDelete = true,
}: AdminClassTypesModalProps) {
  const t = useTranslations("adminPages.classes.classTypes");
  const titleId = useId();
  const [types, setTypes] = useState<AdminClassTypeRow[]>(() => sortTypes(classTypes));
  const [view, setView] = useState<SheetView>("catalog");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ClassTypeSheetTabId>(CLASS_TYPE_SHEET_TAB_DETAILS);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [listFilter, setListFilter] = useState("");
  const [listError, setListError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerTone, setBannerTone] = useState<"ok" | "err">("ok");
  const [resolvedSessionCounts, setResolvedSessionCounts] = useState<Record<string, number>>(
    () => ({ ...sessionCountByTypeId }),
  );
  const fetchGenerationRef = useRef(0);
  const wasOpenRef = useRef(false);
  const onChangedRef = useRef(onChanged);

  useEffect(() => {
    onChangedRef.current = onChanged;
  }, [onChanged]);

  const selectedType = types.find((row) => row.id === selectedId) ?? null;
  const selectedSessionCount =
    selectedId !== null ? (resolvedSessionCounts[selectedId] ?? 0) : 0;

  const filteredTypes = useMemo(() => {
    const query = listFilter.trim().toLowerCase();
    if (query.length === 0) {
      return types;
    }
    return types.filter((type) => {
      const haystack = `${type.name} ${type.slug} ${type.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [listFilter, types]);

  const validationLabels = useMemo(
    () => ({
      nameRequired: t("nameRequired"),
      nameTooLong: t("nameTooLong"),
      nameDuplicate: t("nameDuplicate"),
      slugInvalid: t("slugInvalid"),
      descriptionTooLong: t("descriptionTooLong"),
    }),
    [t],
  );

  const editInitial = useMemo(
    () => (selectedType ? classTypeFormFromRow(selectedType) : emptyClassTypeForm()),
    [selectedType],
  );

  const editForm = useClassTypeEditForm({
    mode: view === "create" ? "create" : "edit",
    typeId: selectedId,
    resetKey:
      view === "catalog"
        ? "catalog"
        : `${view}:${selectedId ?? "new"}:${selectedType?.updatedAt ?? ""}`,
    initial: view === "catalog" ? emptyClassTypeForm() : editInitial,
    existingTypes: types,
    labels: validationLabels,
    onSaved: (saved, mode) => {
      const nextTypes = sortTypes(
        mode === "create" ? [...types, saved] : types.map((row) => (row.id === saved.id ? saved : row)),
      );
      setTypes(nextTypes);
      onChangedRef.current(nextTypes);
      setBanner(mode === "create" ? t("messages.createSuccess") : t("messages.updateSuccess"));
      setBannerTone("ok");
      if (mode === "create") {
        openCatalog();
      } else {
        setSelectedId(saved.id);
        onSelectedTypeIdChange?.(saved.id);
      }
    },
  });

  const refreshTypes = useCallback(async () => {
    const generation = fetchGenerationRef.current + 1;
    fetchGenerationRef.current = generation;
    setLoadState("loading");
    setListError(null);
    try {
      const fetched = await apiFetch<AdminClassTypeRow[]>("/classes/types");
      if (fetchGenerationRef.current !== generation) {
        return;
      }
      setTypes(sortTypes(fetched));
      setLoadState("idle");
    } catch (requestError) {
      if (fetchGenerationRef.current !== generation) {
        return;
      }
      setLoadState("error");
      setListError(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
      );
    }
  }, [t]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    let cancelled = false;
    setResolvedSessionCounts({ ...sessionCountByTypeId });
    void (async () => {
      try {
        const sessions = await apiFetch<AdminSessionClassTypeRef[]>("/classes/admin/sessions");
        if (cancelled) {
          return;
        }
        const counts: Record<string, number> = {};
        for (const session of sessions) {
          counts[session.classType.id] = (counts[session.classType.id] ?? 0) + 1;
        }
        setResolvedSessionCounts(counts);
      } catch {
        if (!cancelled) {
          setResolvedSessionCounts({ ...sessionCountByTypeId });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionCountByTypeId]);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      fetchGenerationRef.current += 1;
      return;
    }
    if (wasOpenRef.current) {
      return;
    }
    wasOpenRef.current = true;
    setListFilter("");
    setListError(null);
    setBanner(null);
    setTypes(sortTypes(classTypes));
    setLoadState("idle");
    setActiveTab(CLASS_TYPE_SHEET_TAB_DETAILS);

    const initialType =
      initialSelectedId !== null
        ? sortTypes(classTypes).find((type) => type.id === initialSelectedId) ?? null
        : null;

    if (initialType !== null) {
      setView("edit");
      setSelectedId(initialType.id);
      onSelectedTypeIdChange?.(initialType.id);
    } else {
      setView("catalog");
      setSelectedId(null);
    }
  }, [classTypes, initialSelectedId, isOpen, onSelectedTypeIdChange]);

  useEffect(() => {
    if (banner === null) {
      return undefined;
    }
    const handle = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(handle);
  }, [banner]);

  function openCatalog(): void {
    setView("catalog");
    setSelectedId(null);
    setActiveTab(CLASS_TYPE_SHEET_TAB_DETAILS);
    editForm.clearMessage();
    onSelectedTypeIdChange?.(null);
  }

  function openCreate(): void {
    setView("create");
    setSelectedId(null);
    setActiveTab(CLASS_TYPE_SHEET_TAB_DETAILS);
    editForm.clearMessage();
    onSelectedTypeIdChange?.(null);
  }

  function openEdit(type: AdminClassTypeRow): void {
    setView("edit");
    setSelectedId(type.id);
    setActiveTab(CLASS_TYPE_SHEET_TAB_DETAILS);
    editForm.clearMessage();
    onSelectedTypeIdChange?.(type.id);
  }

  async function confirmDelete(): Promise<void> {
    if (deleteBusy || selectedId === null || selectedSessionCount > 0) {
      return;
    }
    setDeleteBusy(true);
    try {
      await apiFetch(`/classes/types/${selectedId}`, { method: "DELETE" });
      const nextTypes = types.filter((row) => row.id !== selectedId);
      setTypes(nextTypes);
      onChangedRef.current(nextTypes);
      setBanner(t("messages.deleteSuccess"));
      setBannerTone("ok");
      openCatalog();
    } catch (requestError) {
      setBanner(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
      );
      setBannerTone("err");
    } finally {
      setDeleteBusy(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  const sheetBusy = editForm.busy || deleteBusy;
  const detailTabs = (view === "edit"
    ? CLASS_TYPE_SHEET_TAB_ORDER
    : [CLASS_TYPE_SHEET_TAB_DETAILS]
  ).map((value) => ({
    value,
    label: t(`sheetTabs.${value}`),
  }));

  const toastMessage = editForm.message ?? banner;
  const toastTone = editForm.message ? editForm.messageTone : bannerTone;

  function handleClose(): void {
    if (sheetBusy) {
      return;
    }
    if (view !== "catalog" && editForm.dirty) {
      return;
    }
    onClose();
  }

  function handleCancelEdits(): void {
    if (view === "create" || view === "edit") {
      openCatalog();
      return;
    }
    editForm.cancelEdits();
  }

  function dismissToast(): void {
    editForm.clearMessage();
    setBanner(null);
  }

  const headerTitle =
    view === "catalog"
      ? t("modalTitle")
      : view === "create"
        ? t("formCreateTitle")
        : selectedType?.name ?? t("formEditTitle");

  const listBusy = loadState === "loading";

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={sheetBusy || (view !== "catalog" && editForm.dirty)}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {headerTitle}
          </h2>
          {view === "edit" && allowDelete && selectedType !== null ? (
            <AdminClassTypeDeleteAction
              typeName={selectedType.name}
              sessionCount={selectedSessionCount}
              disabled={sheetBusy || selectedSessionCount > 0}
              pending={deleteBusy}
              onConfirm={() => {
                void confirmDelete();
              }}
            />
          ) : view === "catalog" && allowCreate ? (
            <OmmButton
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={openCreate}
              disabled={listBusy}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              {t("addButton")}
            </OmmButton>
          ) : null}
        </div>
      </header>

      {view === "catalog" ? (
        <AdminClassTypesCatalogPanel
          types={types}
          filteredTypes={filteredTypes}
          listFilter={listFilter}
          onListFilterChange={setListFilter}
          loadState={loadState}
          listError={listError}
          resolvedSessionCounts={resolvedSessionCounts}
          toastMessage={toastMessage}
          toastTone={toastTone}
          onToastDismiss={dismissToast}
          onRetry={() => {
            void refreshTypes();
          }}
          onSelectType={openEdit}
        />
      ) : (
        <>
          <AdminDetailSheetTabBar
            tabs={detailTabs}
            activeTab={activeTab}
            onTabChange={(value) => setActiveTab(value as ClassTypeSheetTabId)}
          />
          <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
            {toastMessage ? (
              <AdminCenterToast
                message={toastMessage}
                tone={toastTone}
                onDismiss={dismissToast}
              />
            ) : null}
            <ClassTypeSheetTabPanels
              activeTab={activeTab}
              mode={view === "create" ? "create" : "edit"}
              selectedType={selectedType}
              sessionCount={selectedSessionCount}
              controller={editForm}
            />
          </div>
          <AdminDetailSheetFormFooter
            saveLabel={view === "create" ? t("createButton") : t("saveButton")}
            cancelLabel={t("cancelButton")}
            savingLabel={t("savingButton")}
            dirty={editForm.dirty}
            busy={editForm.busy}
            onCancel={handleCancelEdits}
            onSave={() => {
              void editForm.save(
                view === "create" ? t("messages.createSuccess") : t("messages.updateSuccess"),
                t("messages.genericError"),
              );
            }}
          />
        </>
      )}
    </OmmDrawerPortal>
  );
}
