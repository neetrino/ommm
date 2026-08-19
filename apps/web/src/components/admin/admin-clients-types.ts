export type ClientTag = "VIP" | "New" | "Beginner" | "Influencer";
export type ClientStatus = "Active" | "Inactive" | "Frozen" | "Blocked";
export type PaymentBehavior = "paid" | "unpaid" | "overdue" | "partial";
export type AttendanceBehavior =
  | "regular"
  | "no-show"
  | "often-cancels"
  | "low-attendance";

export type ClientRow = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  createdAt: string;
  status: ClientStatus;
  isBlocked: boolean;
  source: "website" | "mobile-app" | "admin" | null;
  preferredCoach: { id: string; name: string; count: number } | null;
  paymentBehavior: PaymentBehavior;
  attendanceBehavior: AttendanceBehavior;
  classLevels: string[];
  tags: ClientTag[];
  noteCount: number;
  latestNote: { id: string; body: string; createdAt: string } | null;
  totalVisits: number;
  totalBookings: number;
  totalCancellations: number;
  totalNoShows: number;
  lifetimeValueCents: number;
  lastVisitDate: string | null;
  birthdayMonth: number | null;
  hasGiftCardActivity: boolean;
  activePlanName: string | null;
  activePlanCostCents: number | null;
  activePlanExpiresAt: string | null;
  activePackageId: string | null;
  activePackageStatus:
    | "ACTIVE"
    | "PAUSED"
    | "CANCELLED"
    | "EXPIRED"
    | "PENDING"
    | null;
  nextBooking: {
    id: string;
    startsAt: string;
    classTypeName: string;
  } | null;
};

export type AdminClientsPayload = {
  rows: ClientRow[];
  summary: {
    total: number;
    active: number;
    vip: number;
    totalVisits: number;
    lifetimeValueCents: number;
  };
  filterOptions: {
    preferredCoaches: Array<{ id: string; name: string }>;
    classLevels: string[];
  };
  pagination: { total: number; take: number; offset: number };
};

export type ClientNote = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
};

/** Profile + activity from `GET /clients/:id`. Tab lists load via dedicated paginated endpoints. */
export type ClientDetail = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  createdAt: string;
  notes: ClientNote[];
  activity: ClientRow;
};

export type ClientSheetBookingItem = {
  id: string;
  status: string;
  channel: string;
  attendedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  session: {
    startsAt: string;
    level: string | null;
    classType: { name: string };
    coach: { user: { name: string | null; lastName: string | null } };
  };
};

export type ClientSheetPaymentItem = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  paymentMethod: string | null;
  createdAt: string;
};

export type ClientSheetPackageTypeBalance = {
  id: string;
  classTypeName: string;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

export type ClientSheetPackageItem = {
  id: string;
  status: string;
  packageName: string;
  categoryName: string;
  activationDate: string;
  expirationDate: string;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
  paymentMethod: string | null;
  typeBalances?: ClientSheetPackageTypeBalance[];
  freeze?: {
    allowedCount: number;
    maxDaysPerUse: number;
    usedCount: number;
    remainingCount: number;
    pausedAt: string | null;
    pausedUntil: string | null;
    canFreeze: boolean;
    canUnfreeze: boolean;
  };
};

export type GiftCardRow = {
  id: string;
  amountCents: number;
  balanceCents: number;
  status: string;
  recipientEmail: string | null;
  recipientName: string | null;
  createdAt: string;
};

export type ClientSheetGiftCardItem = GiftCardRow & {
  relation: "purchased" | "received";
};

export type ClientSheetFeedbackItem = {
  id: string;
  classTypeName: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
  rating: number;
  comment: string | null;
  submittedAt: string;
};

export type ClientSheetPaginatedResponse<T> = {
  items: T[];
  total: number;
  take: number;
  offset: number;
};
