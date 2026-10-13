"use client";

import { useEffect, useState } from "react";
import { PackageBookConfirmPanel } from "@/components/payment/package-book-confirm-panel";
import { readPackageBookReference } from "@/lib/package-book-reference";

/** Shows the class confirmation when a package purchase from Book is still open. */
export function PackageBookConfirmHost() {
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    setReference(readPackageBookReference());
  }, []);

  if (reference === null) {
    return null;
  }

  return (
    <div className="mb-4">
      <PackageBookConfirmPanel reference={reference} />
    </div>
  );
}
