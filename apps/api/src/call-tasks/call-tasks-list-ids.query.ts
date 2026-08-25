import { CallTaskStatus, Prisma } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { dueOnFilterCutoff } from './call-tasks-due.util';
import type {
  CallTaskListOrder,
  CallTaskListStatus,
  ListCallTasksQueryDto,
} from './dto/list-call-tasks-query.dto';

function listStatusSql(
  status: CallTaskListStatus | undefined,
  cutoff: Date,
): Prisma.Sql {
  if (status === 'OVERDUE') {
    return Prisma.sql`status::text = ${CallTaskStatus.PENDING} AND "dueOn" < ${cutoff}`;
  }
  if (status === 'PENDING') {
    return Prisma.sql`status::text = ${CallTaskStatus.PENDING}`;
  }
  if (status === 'DONE' || status === 'CANCELLED') {
    return Prisma.sql`status::text = ${status}`;
  }
  return Prisma.sql`TRUE`;
}

function listSearchSql(q: string | undefined): Prisma.Sql {
  const trimmed = q?.trim();
  if (!trimmed) {
    return Prisma.sql`TRUE`;
  }
  const pattern = `%${trimmed}%`;
  return Prisma.sql`(
    "contactName" ILIKE ${pattern}
    OR phone ILIKE ${pattern}
    OR comment ILIKE ${pattern}
  )`;
}

function listOrderSql(
  order: CallTaskListOrder | undefined,
  cutoff: Date,
): Prisma.Sql {
  const pendingFirst = Prisma.sql`CASE
    WHEN status::text = ${CallTaskStatus.PENDING}
      AND "dueOn" >= ${cutoff} THEN 0
    ELSE 1
  END`;
  if (order === 'due-desc') {
    return Prisma.sql`${pendingFirst}, "dueOn" DESC, "createdAt" DESC`;
  }
  if (order === 'newest') {
    return Prisma.sql`${pendingFirst}, "createdAt" DESC`;
  }
  return Prisma.sql`${pendingFirst}, "dueOn" ASC, "createdAt" ASC`;
}

export function callTaskListIdsQuery(query: ListCallTasksQueryDto): Prisma.Sql {
  const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
  const offset = query.offset ?? 0;
  const cutoff = dueOnFilterCutoff();
  return Prisma.sql`
    SELECT id FROM "CallTask"
    WHERE ${listStatusSql(query.status, cutoff)}
      AND ${listSearchSql(query.q)}
    ORDER BY ${listOrderSql(query.order, cutoff)}
    LIMIT ${take} OFFSET ${offset}
  `;
}
