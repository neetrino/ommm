import type {
  StaffActivityNotification,
  StaffActivityType,
} from '@prisma/client';

export type StaffActivityDto = {
  id: string;
  type: StaffActivityType;
  bookingId: string | null;
  memberName: string;
  className: string;
  sessionStartsAt: string;
  createdAt: string;
  isUnread: boolean;
};

export function toStaffActivityDto(
  row: StaffActivityNotification,
  isUnread: boolean,
): StaffActivityDto {
  return {
    id: row.id,
    type: row.type,
    bookingId: row.bookingId,
    memberName: row.memberName,
    className: row.className,
    sessionStartsAt: row.sessionStartsAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    isUnread,
  };
}
