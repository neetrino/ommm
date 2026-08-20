import type { AdminAssignableUser } from "@/components/admin/admin-gift-cards-types";

export type AdminGiftCardFormMode = "create" | "edit";

export type AdminCreateGiftCardFormInitialValues = {
  amountAmd: number;
  quantity: number;
  availableQuantity?: number;
  minQuantity?: number;
  message: string;
  expiresAt: string;
};

export type AdminCreateGiftCardFormProps = {
  users: readonly AdminAssignableUser[];
  onSaved: (createdCount: number) => void;
  onCancel: () => void;
  mode?: AdminGiftCardFormMode;
  batchId?: string;
  initialValues?: AdminCreateGiftCardFormInitialValues;
};
