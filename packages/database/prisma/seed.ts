import { PrismaClient } from "@prisma/client";
import { seedAnalyticsDashboard } from "./seed/seed-analytics-dashboard";
import { seedClassSessionsAndBookings } from "./seed/seed-classes";
import { seedContentPosts } from "./seed/seed-content";
import {
  seedAchievements,
  seedContactMessages,
  seedGiftCards,
  seedScheduleItems,
  seedStudioSettings,
} from "./seed/seed-extras";
import { seedMemberPackages, seedPackagePlans } from "./seed/seed-packages";
import { seedUsers } from "./seed/seed-users";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const users = await seedUsers(prisma);
  await seedStudioSettings(prisma);
  await seedAchievements(prisma, users);

  const plans = await seedPackagePlans(prisma);
  await seedMemberPackages(prisma, users, plans);

  await seedClassSessionsAndBookings(prisma, users);
  await seedAnalyticsDashboard(prisma, users, plans);
  await seedContentPosts(prisma);
  await seedScheduleItems(prisma);
  await seedGiftCards(prisma, users);
  await seedContactMessages(prisma);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
