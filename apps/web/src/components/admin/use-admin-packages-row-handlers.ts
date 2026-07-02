"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import type { AdminClassTypeRow } from "@/components/admin/admin-types-management";
import {
  normalizeAdminPackageRow,
  type AdminPackageRow,
  upsertAdminPackageRow,
} from "@/components/admin/admin-packages-types";

type UseAdminPackagesRowHandlersOptions = {
  setPackageRows: React.Dispatch<React.SetStateAction<readonly AdminPackageRow[]>>;
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>;
  setExpandedCategoryKeys: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>;
  setClassTypes: React.Dispatch<React.SetStateAction<readonly AdminClassTypeRow[]>>;
  setToastMessage: React.Dispatch<React.SetStateAction<string | null>>;
  closeDeletePackage: () => void;
  deleteSuccessMessage: string;
  categoryDeleteSuccessMessage: string;
};

export function useAdminPackagesRowHandlers({
  setPackageRows,
  setSelectedCategoryIds,
  setExpandedCategoryKeys,
  setClassTypes,
  setToastMessage,
  closeDeletePackage,
  deleteSuccessMessage,
  categoryDeleteSuccessMessage,
}: UseAdminPackagesRowHandlersOptions) {
  const router = useRouter();

  const handlePackageCreated = useCallback(
    (saved: AdminPackageRow) => {
      const normalized = normalizeAdminPackageRow(saved);
      setPackageRows((current) => upsertAdminPackageRow(current, normalized));
      setSelectedCategoryIds((current) => {
        const next = new Set(current);
        next.add(normalized.categorySlug);
        return next;
      });
      setExpandedCategoryKeys((current) => {
        const next = new Set(current);
        next.add(normalized.categorySlug);
        return next;
      });
    },
    [setExpandedCategoryKeys, setPackageRows, setSelectedCategoryIds],
  );

  const handlePackageUpdated = useCallback(
    (saved: AdminPackageRow) => {
      setPackageRows((current) => upsertAdminPackageRow(current, normalizeAdminPackageRow(saved)));
    },
    [setPackageRows],
  );

  const handleCategoryPlansUpdated = useCallback(
    (updated: readonly AdminPackageRow[]) => {
      setPackageRows((current) => {
        let next = current;
        for (const row of updated) {
          next = upsertAdminPackageRow(next, normalizeAdminPackageRow(row));
        }
        return next;
      });
    },
    [setPackageRows],
  );

  const handlePackageDeleted = useCallback(
    (packageId: string) => {
      setPackageRows((current) => current.filter((row) => row.id !== packageId));
      setToastMessage(deleteSuccessMessage);
      closeDeletePackage();
      router.refresh();
    },
    [closeDeletePackage, deleteSuccessMessage, router, setPackageRows, setToastMessage],
  );

  const handleCategoryRenamed = useCallback(
    (
      categorySlug: string,
      _fromName: string,
      _toName: string,
      updated: readonly AdminPackageRow[],
    ) => {
      const normalizedUpdated = updated.map(normalizeAdminPackageRow);
      setPackageRows((current) => {
        const withoutPreviousCategory = current.filter(
          (row) => row.categorySlug !== categorySlug,
        );
        let next = withoutPreviousCategory;
        for (const row of normalizedUpdated) {
          next = upsertAdminPackageRow(next, row);
        }
        return next;
      });
      router.refresh();
    },
    [router, setPackageRows],
  );

  const handleCategoryDeleted = useCallback(
    (categorySlug: string, deletedPackageIds: readonly string[]) => {
      const removed = new Set(deletedPackageIds);
      setPackageRows((current) =>
        current.filter(
          (row) => !removed.has(row.id) && row.categorySlug !== categorySlug,
        ),
      );
      setSelectedCategoryIds((current) => {
        const next = new Set(current);
        next.delete(categorySlug);
        return next;
      });
      setExpandedCategoryKeys((current) => {
        if (!current.has(categorySlug)) {
          return current;
        }
        const next = new Set(current);
        next.delete(categorySlug);
        return next;
      });
      setToastMessage(categoryDeleteSuccessMessage);
      router.refresh();
    },
    [
      categoryDeleteSuccessMessage,
      router,
      setExpandedCategoryKeys,
      setPackageRows,
      setSelectedCategoryIds,
      setToastMessage,
    ],
  );

  const handleClassTypesChanged = useCallback(
    (nextTypes: readonly AdminClassTypeRow[]) => {
      setClassTypes(nextTypes);
    },
    [setClassTypes],
  );

  return {
    handlePackageCreated,
    handlePackageUpdated,
    handleCategoryPlansUpdated,
    handlePackageDeleted,
    handleCategoryRenamed,
    handleCategoryDeleted,
    handleClassTypesChanged,
  };
}
