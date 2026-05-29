export type ClientTag = "VIP" | "New" | "At Risk" | "Beginner";
export type ClientStatus = "Active" | "Inactive" | "Frozen";
export type PaymentBehavior = "paid" | "unpaid" | "overdue" | "partial";
export type AttendanceBehavior =
  | "regular"
  | "no-show"
  | "often-cancels"
  | "low-attendance";

export type ClientMembership = {
  id: string;
  status: string;
  sessionsRemaining: number | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    sessionsPerMonth: number | null;
    isUnlimited: boolean;
    billingPeriod: string;
    priceCents: number;
  };
};

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
  source: "website" | "mobile-app" | "admin" | null;
  preferredCoach: { id: string; name: string; count: number } | null;
  memberships: ClientMembership[];
  activeMembership: ClientMembership | null;
  packageType: "single-class" | "monthly-package" | "vip-package" | null;
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
};

export type AdminClientsPayload = {
  rows: ClientRow[];
  summary: {
    total: number;
    active: number;
    vip: number;
    atRisk: number;
    totalVisits: number;
    lifetimeValueCents: number;
  };
  filterOptions: {
    preferredCoaches: Array<{ id: string; name: string }>;
    classLevels: string[];
  };
  pagination: { total: number; take: number; offset: number };
};

export type MembershipPlanOption = {
  id: string;
  name: string;
  isActive: boolean;
  priceCents: number;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
};

export type ClientDetail = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  createdAt: string;
  memberships: ClientMembership[];
  bookings: Array<{
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
  }>;
  payments: Array<{
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    description: string | null;
    createdAt: string;
  }>;
  giftCardsPurchased: Array<GiftCardRow>;
  giftCardsReceived: Array<GiftCardRow>;
  notes: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string | null; email: string };
  }>;
  activity: ClientRow;
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
