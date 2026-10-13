"use client";

import { useCallback, useEffect, useRef } from "react";

const bookingSheetOwners = new Set<string>();

function claimSessionBookingSheet(sessionId: string): boolean {
  if (bookingSheetOwners.has(sessionId)) {
    return false;
  }
  bookingSheetOwners.add(sessionId);
  return true;
}

function releaseSessionBookingSheet(sessionId: string): void {
  bookingSheetOwners.delete(sessionId);
}

/**
 * One mounted booking flow owns the package/purchase sheet for a session.
 * Other instances (schedule row + detail modal) must not open a second copy.
 */
export function useSessionBookingSheetClaim(sessionId: string): {
  claim: () => boolean;
  release: () => void;
} {
  const ownsRef = useRef(false);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const release = useCallback((): void => {
    if (!ownsRef.current) {
      return;
    }
    ownsRef.current = false;
    releaseSessionBookingSheet(sessionIdRef.current);
  }, []);

  const claim = useCallback((): boolean => {
    if (ownsRef.current) {
      return true;
    }
    if (!claimSessionBookingSheet(sessionIdRef.current)) {
      return false;
    }
    ownsRef.current = true;
    return true;
  }, []);

  useEffect(() => release, [release]);

  return { claim, release };
}
