export type AdminManagerStatusFilter = "all" | "active" | "blocked";
export type AdminManagerOrder = "newest" | "oldest";

export type AdminManagersFilterValues = {
  q: string;
  status: AdminManagerStatusFilter;
  order: AdminManagerOrder;
};

export type AdminManagerDirectoryRow = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  isBlocked: boolean;
  invitePending: boolean;
  isSelf: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminManagersListPayload = {
  items: AdminManagerDirectoryRow[];
  total: number;
  take: number;
  offset: number;
};
