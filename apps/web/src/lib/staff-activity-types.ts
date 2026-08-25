export type StaffActivityType = "BOOKING_CREATED" | "BOOKING_CANCELLED";

export type StaffActivityRow = {
  id: string;
  type: StaffActivityType;
  bookingId: string | null;
  memberName: string;
  className: string;
  sessionStartsAt: string;
  createdAt: string;
  isUnread: boolean;
};

export type StaffActivityListPayload = {
  items: StaffActivityRow[];
  total: number;
  take: number;
  offset: number;
};

export const STAFF_ACTIVITY_HEADER_TAKE = 5;
export const STAFF_ACTIVITY_PAGE_TAKE = 25;
