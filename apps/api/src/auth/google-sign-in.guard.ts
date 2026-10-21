import { UnauthorizedException } from '@nestjs/common';
import { isSignInBlocked } from './user-sign-in-block';

/** Closed accounts must not get a session or a freshly created Google user. */
export class GoogleAccountClosedException extends UnauthorizedException {
  constructor(readonly uiLocale: string) {
    super('No account exists for this email');
  }
}

export function assertGoogleSignInAllowed(user: {
  isBlocked: boolean;
  deletedAt: Date | null;
  locale: string;
}): void {
  if (user.deletedAt !== null) {
    throw new GoogleAccountClosedException(user.locale);
  }
  if (isSignInBlocked(user)) {
    throw new UnauthorizedException();
  }
}
