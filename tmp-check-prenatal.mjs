import fs from "fs";
import { PrismaClient } from "@prisma/client";

const env = fs.readFileSync("d:/Neetrino/ommm/.env", "utf8");
const match = env.match(/DATABASE_URL="([^"]+)"/);
process.env.DATABASE_URL = match[1];
const prisma = new PrismaClient();

const session = await prisma.classSession.findUnique({
  where: { id: "cmuu1aqfq00hkob01yw1ws07f" },
  select: {
    status: true,
    capacity: true,
    updatedAt: true,
    bookings: { select: { status: true } },
    waitlistEntries: { select: { status: true } },
  },
});
const booked = session.bookings.filter((booking) =>
  ["BOOKED", "COMPLETED", "MISSED"].includes(booking.status),
).length;
console.log(
  JSON.stringify(
    {
      status: session.status,
      capacity: session.capacity,
      booked,
      spotsLeft: session.capacity - booked,
      updatedAt: session.updatedAt,
      waitlist: session.waitlistEntries.map((entry) => entry.status),
    },
    null,
    2,
  ),
);
await prisma.$disconnect();
