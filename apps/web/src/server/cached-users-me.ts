import { cache } from "react";
import { headers } from "next/headers";
import { cookieHeaderHasAccessToken } from "@/lib/auth-cookie";
import { serverApiJson } from "@/lib/server-api";

export type CachedUsersMeAchievement = {
  title: string;
  unlockedAt: string;
};

export type CachedUsersMeNotificationPrefs = {
  bookingReminders: boolean;
  waitlistAlerts: boolean;
  promotions: boolean;
  communityUpdates: boolean;
};

export type CachedUsersMePayload = {
  user: {
    role: string;
    locale?: string | null;
    name?: string | null;
    lastName?: string | null;
    email?: string;
    phone?: string | null;
    homeImageUrl?: string | null;
    avatarUrl?: string | null;
    giftCreditsCents?: number;
  };
  coachProfileId: string | null;
  /** True when a Google-linked member must provide a phone before using the account. */
  needsPhoneCompletion?: boolean;
  achievements?: CachedUsersMeAchievement[];
  notificationPrefs?: CachedUsersMeNotificationPrefs;
};

export type CachedUsersMeResult =
  | { ok: true; cookie: string; data: CachedUsersMePayload }
  | { ok: false; status: number; cookie: string };

/** One `/users/me` per RSC request — shared by layout, home, hub, and prefs. */
export const getCachedUsersMe = cache(async (): Promise<CachedUsersMeResult> => {
  const cookie = (await headers()).get("cookie") ?? "";
  if (!cookieHeaderHasAccessToken(cookie)) {
    return { ok: false, status: 401, cookie };
  }

  const res = await serverApiJson<CachedUsersMePayload>("/users/me", cookie);
  if (!res.ok) {
    return { ok: false, status: res.status, cookie };
  }

  return { ok: true, cookie, data: res.data };
});
