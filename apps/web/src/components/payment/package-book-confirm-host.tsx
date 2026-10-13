"use client";

import { useSyncExternalStore } from "react";
import { PackageBookConfirmPanel } from "@/components/payment/package-book-confirm-panel";
import { readPackageBookReference } from "@/lib/package-book-reference";

function subscribePackageBookReference(): () => void {
  return () => undefined;
}

/** Shows the class confirmation when a package purchase from Book is still open. */
export function PackageBookConfirmHost() {
  const reference = useSyncExternalStore(
    subscribePackageBookReference,
    readPackageBookReference,
    () => null,
  );

  if (reference === null) {
    return null;
  }

  return (
    <div className="mb-4">
      <PackageBookConfirmPanel reference={reference} />
    </div>
  );
}
