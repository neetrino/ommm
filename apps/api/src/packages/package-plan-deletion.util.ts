/** Builds a user-facing conflict message when plan deletion is blocked by live memberships. */
export function buildPlanDeletionBlockedMessage(blockingCount: number): string {
  if (blockingCount === 1) {
    return 'Cannot delete this package plan because 1 member still has an active, pending, or paused subscription.';
  }
  return `Cannot delete this package plan because ${blockingCount} members still have active, pending, or paused subscriptions.`;
}
