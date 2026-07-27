export type AdminPlanRecord = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  classTypeId?: string | null;
  description: string | null;
  priceCents: number;
  discountedPriceCents: number | null;
  pricePerSessionCents: number;
  showPricePerSession: boolean;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  startDate?: Date | null;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
  guestCount: number;
  availableQuantity: number | null;
  buttonLabel: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  typeSessionAllocations?: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type StoredTypeSessionAllocation = {
  classTypeId: string;
  classTypeName?: string;
  sessionCount: number;
  description?: string | null;
};

export type ResolvedTypeSessionAllocations = {
  allocations: StoredTypeSessionAllocation[];
  totalSessions: number;
  classTypeId: string | null;
};

export const USER_PACKAGE_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  PENDING: 'PENDING',
} as const;

export const DEFAULT_BILLING_PERIOD = 'monthly';
export const DEFAULT_PERIOD_DAYS = 30;
export const CATEGORY_FALLBACK = 'General';

export type PublicPlanSource = {
  id: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  classTypeId?: string | null;
  description: string | null;
  priceCents: number;
  discountedPriceCents: number | null;
  pricePerSessionCents: number;
  showPricePerSession: boolean;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  startDate?: Date | null;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
  guestCount: number;
  availableQuantity: number | null;
  displayOrder: number;
  typeSessionAllocations?: unknown;
};
