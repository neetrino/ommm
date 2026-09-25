import { formatPaymentDuePurchaseLabel } from "@/components/admin/admin-dashboard-payment-due";
import type { PaymentDueClientGroup } from "@/components/admin/admin-dashboard-payment-due";

type PaymentDueClientCardProps = {
  group: PaymentDueClientGroup;
  boughtLabel: string;
  openLabel: string;
  onOpen: () => void;
};

export function PaymentDueClientCard({
  group,
  boughtLabel,
  openLabel,
  onOpen,
}: PaymentDueClientCardProps) {
  const initial = group.clientName.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <li className="min-w-0">
      <button
        type="button"
        className="flex h-full w-full flex-col rounded-[22px] border border-white/80 bg-gradient-to-b from-white to-rose-50/90 p-3.5 text-left shadow-[0_16px_32px_-20px_rgba(136,19,55,0.55)] ring-1 ring-white/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-18px_rgba(136,19,55,0.62)]"
        aria-label={openLabel}
        onClick={onOpen}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            {initial}
          </span>
          <span className="min-w-0 break-words font-serif text-base leading-tight text-sage-900">
            {group.clientName}
          </span>
        </span>
        <span className="mt-3.5">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-500">
            {boughtLabel}
          </span>
          <span className="mt-1.5 flex flex-col gap-1.5">
            {group.packages.map((item) => (
              <span
                key={item.packageId}
                className="block break-words rounded-xl bg-white/90 px-2.5 py-1.5 text-xs font-medium leading-snug text-rose-950 ring-1 ring-rose-100"
              >
                {formatPaymentDuePurchaseLabel(item.categoryName, item.packageName)}
              </span>
            ))}
          </span>
        </span>
      </button>
    </li>
  );
}
