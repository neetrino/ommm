import { BadRequestException } from '@nestjs/common';
import { SessionListOrder } from '../common/enums/list-order.enum';
import {
  resolveSessionListOrderBy,
  sortAdminSessionRows,
} from '../common/list-order.helpers';
import type { PrismaService } from '../prisma/prisma.service';
import {
  ADMIN_SESSION_INCLUDE,
  mapAdminSessionRows,
  type AdminSessionRow,
} from './classes-session.helpers';
import {
  SCHEDULE_EXPORT_MAX_ROWS,
  SCHEDULE_EXPORT_TOO_MANY,
} from './classes-sessions-export.constants';
import {
  buildSessionsListWhere,
  filterSessionRows,
  normalizeSessionsListQuery,
} from './classes-sessions-list-filters';
import type { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';

/**
 * Every admin session matching the schedule filters, in list order.
 * Refuses an unbounded dump once the SQL match set exceeds the workbook cap.
 */
export async function loadAdminSessionsForExport(
  prisma: PrismaService,
  query: AdminListSessionsQueryDto,
): Promise<AdminSessionRow[]> {
  const normalizedQuery = normalizeSessionsListQuery(query);
  const where = buildSessionsListWhere(normalizedQuery);
  const order = normalizedQuery.order ?? SessionListOrder.UPCOMING;
  const total = await prisma.classSession.count({ where });
  if (total > SCHEDULE_EXPORT_MAX_ROWS) {
    throw new BadRequestException(SCHEDULE_EXPORT_TOO_MANY);
  }
  const sessions = await prisma.classSession.findMany({
    where,
    include: ADMIN_SESSION_INCLUDE,
    orderBy: resolveSessionListOrderBy(order),
  });
  const filtered = filterSessionRows(
    mapAdminSessionRows(sessions),
    normalizedQuery,
  );
  return sortAdminSessionRows(filtered, order);
}
