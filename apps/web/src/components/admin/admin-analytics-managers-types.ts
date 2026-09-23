export type ManagerInviteReferredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ManagerInviteAnalyticsRow = {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  referredCount: number;
  referredUsers: ManagerInviteReferredUser[];
};

export type ManagerInvitesAnalyticsPayload = {
  range: { from: string; to: string };
  totals: {
    managers: number;
    referredInRange: number;
  };
  managers: ManagerInviteAnalyticsRow[];
};
