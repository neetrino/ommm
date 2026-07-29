import type { ClientRow } from "@/components/admin/admin-clients-types";

export type ClientListPackageTone = "active" | "paused" | "pending" | "expired" | "none";

export type ClientListPackageDisplay = {
  tone: ClientListPackageTone;
  planName: string | null;
};

/** Resolves membership badge state for the admin clients list column. */
export function resolveClientListPackageDisplay(
  row: Pick<ClientRow, "activePackageId" | "activePackageStatus" | "activePlanName">,
): ClientListPackageDisplay {
  if (row.activePackageId === null || row.activePackageStatus === null) {
    return { tone: "none", planName: null };
  }
  if (row.activePackageStatus === "ACTIVE") {
    return { tone: "active", planName: row.activePlanName };
  }
  if (row.activePackageStatus === "PAUSED") {
    return { tone: "paused", planName: row.activePlanName };
  }
  if (row.activePackageStatus === "PENDING") {
    return { tone: "pending", planName: row.activePlanName };
  }
  return { tone: "expired", planName: row.activePlanName };
}

export function clientListPackageBadgeClassName(tone: ClientListPackageTone): string {
  const base =
    "inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]";
  if (tone === "active") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (tone === "paused") {
    return `${base} border-sand-300 bg-sand-50 text-sage-700`;
  }
  if (tone === "pending") {
    return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  }
  if (tone === "expired") {
    return `${base} border-rose-200 bg-rose-50 text-rose-800`;
  }
  return `${base} border-sage-200/80 bg-sage-50/80 text-sage-500`;
}
