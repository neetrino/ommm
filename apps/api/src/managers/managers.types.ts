export type ManagerDirectoryRow = {
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

export type ManagerListPayload = {
  items: ManagerDirectoryRow[];
  total: number;
  take: number;
  offset: number;
};

export type ManagerUserRecord = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  isBlocked: boolean;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
};
