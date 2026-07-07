export const GOOGLE_PROVIDER = 'google';

export type GoogleOAuthProfile = {
  providerAccountId: string;
  providerEmail: string;
  providerEmailVerified: true;
  name: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export type GoogleAuthCompletion =
  | { mode: 'session'; accessToken: string; redirectUrl: string }
  | { mode: 'pending-signup'; redirectUrl: string };
