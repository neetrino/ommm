import { PrismaClient } from "@prisma/client";
import { SEED_SESSION_TITLE_PREFIX } from "./constants";
import { CLASS_TYPE_SEEDS, SESSION_BLUEPRINTS, sessionWindow } from "./class-data";
import { seedBookingsForSessions } from "./seed-bookings";
import type { SeededUsers } from "./seed-users";

export async function seedClassTypes(
  prisma: PrismaClient,
): Promise<Map<string, { id: string; slug: string }>> {
  const bySlug = new Map<string, { id: string; slug: string }>();
  for (const type of CLASS_TYPE_SEEDS) {
    const record = await prisma.classType.upsert({
      where: { slug: type.slug },
      update: { name: type.name, description: type.description },
      create: { slug: type.slug, name: type.name, description: type.description },
      select: { id: true, slug: true },
    });
    bySlug.set(record.slug, record);
  }
  return bySlug;
}

export async function seedClassSessionsAndBookings(
  prisma: PrismaClient,
  users: SeededUsers,
): Promise<void> {
  await prisma.classSession.deleteMany({
    where: { title: { startsWith: SEED_SESSION_TITLE_PREFIX } },
  });

  const classTypes = await seedClassTypes(prisma);
  const coachByEmail = new Map(users.coaches.map((coach) => [coach.email, coach.profileId]));
  const sessionIds = new Map<string, string>();

  await assignCoachClassTypes(prisma, users, classTypes);

  for (const blueprint of SESSION_BLUEPRINTS) {
    const classType = classTypes.get(blueprint.classTypeSlug);
    const coachId = coachByEmail.get(blueprint.coachEmail);
    if (classType === undefined || coachId === undefined) {
      continue;
    }
    const { startsAt, endsAt } = sessionWindow(blueprint.dayOffset, blueprint.hour);
    const session = await prisma.classSession.create({
      data: {
        title: blueprint.title,
        description: "Seeded session for end-to-end QA.",
        classTypeId: classType.id,
        coachId,
        startsAt,
        endsAt,
        capacity: blueprint.capacity,
        level: blueprint.level,
        priceCents: blueprint.priceCents,
        status: blueprint.status,
      },
      select: { id: true },
    });
    sessionIds.set(blueprint.key, session.id);
  }

  await seedBookingsForSessions(prisma, users, sessionIds);
}

async function assignCoachClassTypes(
  prisma: PrismaClient,
  users: SeededUsers,
  classTypes: Map<string, { id: string; slug: string }>,
): Promise<void> {
  const assignments: ReadonlyArray<{ email: string; slugs: string[] }> = [
    { email: "coach@ommm.local", slugs: ["reformer-group"] },
    { email: "coach2@ommm.local", slugs: ["reformer-individual"] },
    { email: "coach3@ommm.local", slugs: ["yoga", "mat-pilates", "dances"] },
  ];

  for (const assignment of assignments) {
    const coach = users.coaches.find((entry) => entry.email === assignment.email);
    if (coach === undefined) {
      continue;
    }
    const typeIds = assignment.slugs
      .map((slug) => classTypes.get(slug)?.id)
      .filter((id): id is string => id !== undefined);
    await prisma.coachProfile.update({
      where: { id: coach.profileId },
      data: { assignedClassTypeIds: typeIds },
    });
  }
}
