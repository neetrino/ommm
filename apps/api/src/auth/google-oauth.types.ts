export const GOOGLE_PROVIDER = 'google';

export type GoogleOAuthProfile = {
  providerAccountId: string;
  providerEmail: string;
  providerEmailVerified: true;
  name: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export type GoogleAuthCompletion = {
  accessToken: string;
  redirectUrl: string;
};
