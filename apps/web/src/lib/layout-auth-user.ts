import type { MeApiUser } from "@/lib/me-api-types";

/** Authenticated viewer fields shared by layouts and the marketing header. */
export type LayoutAuthUser = {
  role: string;
  locale: string | null;
  name: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  homeImageUrl: string | null;
  avatarUrl: string | null;
};

/** Maps `/users/me` user payload to layout auth shape. */
export function layoutAuthUserFromMe(user: MeApiUser): LayoutAuthUser {
  return {
    role: user.role,
    locale: user.locale ?? null,
    name: user.name ?? null,
    lastName: user.lastName ?? null,
    email: user.email ?? "",
    phone: user.phone ?? null,
    homeImageUrl: user.homeImageUrl ?? null,
    avatarUrl: user.avatarUrl ?? null,
  };
}
