import type { AdminPackageRow } from "@/components/admin/admin-packages-types";

export type AdminPackageFormMode = "create" | "edit" | "pricing" | "add-tier" | "edit-tier";

export type AdminPackageFormCategoryOption = {
  id: string;
  label: string;
};

export type AdminPackageFormProps = {
  mode: AdminPackageFormMode;
  packageId?: string;
  initialCategoryName: string;
  categoryOptions: readonly AdminPackageFormCategoryOption[];
  classTypeOptions: readonly { id: string; name: string }[];
  initialPackage?: AdminPackageRow;
  nextDisplayOrder?: number;
  onSaved: (saved: AdminPackageRow) => void;
  onCancel: () => void;
  showCloseButton?: boolean;
};
