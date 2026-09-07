import { PrismaClient, BookingStatus, ClassSessionStatus } from '@prisma/client';
import { CoachSalaryAccrualService } from '../../../apps/api/src/coaches/coaches-salary-accrual.service';

const p = new PrismaClient();
const MARKER = `ui-salary-check-${Date.now()}`;

async function main(): Promise<void> {
  const coach = await p.coachProfile.findFirst({
    where: { user: { name: 'Taguhi' } },
    select: { id: true },
  });
  if (!coach) throw new Error('Taguhi not found');

  const rate = await p.coachClassTypeRate.findFirst({
    where: { coachProfileId: coach.id },
    include: { classType: { select: { name: true } } },
  });
  if (!rate) throw new Error('Taguhi has no rates — set rates in Admin → Coaches first');

  const member = await p.user.findFirst({
    where: { role: 'USER' },
    select: { id: true },
  });
  if (!member) throw new Error('No USER');

  const startsAt = new Date('2026-09-05T10:00:00.000Z');
  const endsAt = new Date('2026-09-05T11:00:00.000Z');

  const session = await p.classSession.create({
    data: {
      title: MARKER,
      classTypeId: rate.classTypeId,
      coachId: coach.id,
      startsAt,
      endsAt,
      capacity: 8,
      status: ClassSessionStatus.FINISHED,
      bookings: {
        create: {
          userId: member.id,
          status: BookingStatus.COMPLETED,
        },
      },
    },
    select: { id: true },
  });

  const accrualService = new CoachSalaryAccrualService(p as never);
  await accrualService.accrueFinishedSession(session.id);
  const row = await p.coachSalaryAccrual.findUnique({
    where: { classSessionId: session.id },
    select: { amountAmd: true, periodYear: true, periodMonth: true },
  });

  console.log(
    JSON.stringify(
      {
        kept: true,
        coach: 'Taguhi Sukiasyan',
        classType: rate.classType.name,
        amountAmd: row?.amountAmd,
        month: row
          ? `${row.periodYear}-${String(row.periodMonth).padStart(2, '0')}`
          : null,
        sessionId: session.id,
        title: MARKER,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await p.$disconnect();
  });
