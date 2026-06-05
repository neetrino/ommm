import { Role } from "@prisma/client";

export const DEMO_USER_PASSWORD = "Demo1234!";
export const BCRYPT_SALT_ROUNDS = 12;
export const SEED_SESSION_TITLE_PREFIX = "[Seed]";
export const SEED_SCHEDULE_CLASS_PREFIX = "[Seed]";
export const PACKAGE_DAYS_PER_MONTH = 30;
export const SIX_MONTH_PERIOD_DAYS = 6 * PACKAGE_DAYS_PER_MONTH;

export type DemoUserSeed = {
  email: string;
  name: string;
  lastName?: string;
  role: Role;
  locale?: string;
  isBlocked?: boolean;
};

/** One login per role; password: DEMO_USER_PASSWORD */
export const DEMO_USERS_BY_ROLE: readonly DemoUserSeed[] = [
  { email: "admin@ommm.local", name: "Arpine", lastName: "Sahakyan", role: Role.ADMIN, locale: "hy" },
  { email: "manager@ommm.local", name: "Gor", lastName: "Mkrtchyan", role: Role.MANAGER, locale: "hy" },
  {
    email: "content-admin@ommm.local",
    name: "Mariam",
    lastName: "Avetisyan",
    role: Role.CONTENT_ADMIN,
    locale: "en",
  },
  { email: "coach@ommm.local", name: "Sona", lastName: "Melikyan", role: Role.COACH, locale: "hy" },
  { email: "member@ommm.local", name: "Ani", lastName: "Hakobyan", role: Role.USER, locale: "hy" },
];

export const EXTRA_MEMBER_USERS: readonly DemoUserSeed[] = [
  { email: "member2@ommm.local", name: "Narek", lastName: "Sargsyan", role: Role.USER, locale: "ru" },
  { email: "member3@ommm.local", name: "Lilit", lastName: "Grigoryan", role: Role.USER, locale: "en" },
  { email: "member4@ommm.local", name: "Tigran", lastName: "Davtyan", role: Role.USER, locale: "hy" },
  {
    email: "blocked@ommm.local",
    name: "Blocked",
    lastName: "Member",
    role: Role.USER,
    locale: "hy",
    isBlocked: true,
  },
];

export const EXTRA_COACH_USERS: readonly DemoUserSeed[] = [
  { email: "coach2@ommm.local", name: "Arman", lastName: "Petrosyan", role: Role.COACH, locale: "hy" },
  { email: "coach3@ommm.local", name: "Elena", lastName: "Kocharyan", role: Role.COACH, locale: "en" },
];
