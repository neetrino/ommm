import type { CallTask } from '@prisma/client';
import { callTaskDueFlags } from './call-tasks-due.util';

export type CallTaskDto = {
  id: string;
  contactName: string;
  phone: string;
  comment: string;
  dueOn: string;
  dueOnDate: string;
  status: CallTask['status'];
  userId: string | null;
  createdById: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isDueToday: boolean;
};

export function toCallTaskDto(row: CallTask, now: Date = new Date()): CallTaskDto {
  const flags = callTaskDueFlags(row.dueOn, now);
  return {
    id: row.id,
    contactName: row.contactName,
    phone: row.phone,
    comment: row.comment,
    dueOn: row.dueOn.toISOString(),
    dueOnDate: flags.dueOnDate,
    status: row.status,
    userId: row.userId,
    createdById: row.createdById,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    isOverdue: flags.isOverdue,
    isDueToday: flags.isDueToday,
  };
}
