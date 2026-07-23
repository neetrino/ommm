/** Shape of `GET /v1/users/me` — matches `UsersService.getMe`. */
export type MeApiUser = {
  role: string;
  locale?: string | null;
  name?: string | null;
  lastName?: string | null;
  email?: string;
  phone?: string | null;
  homeImageUrl?: string | null;
  avatarUrl?: string | null;
};

export type MeApiResponse = {
  user: MeApiUser;
  coachProfileId: string | null;
  /** Shared coach-profile bio — same field as admin Coaches CRM. */
  coachBio?: string | null;
};
