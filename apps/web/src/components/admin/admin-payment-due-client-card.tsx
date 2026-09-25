import {
  formatPaymentDuePurchaseLabel,
  PAYMENT_DUE_CARD_VISIBLE_PACKAGES,
  visiblePaymentDuePackages,
  type PaymentDueClientGroup,
  type PaymentDuePackageLine,
} from "@/components/admin/admin-dashboard-payment-due";

const PACKAGE_SLOT_CLASS =
  "line-clamp-2 h-10 overflow-hidden rounded-xl bg-white/90 px-2.5 py-1 text-xs font-medium leading-4 text-rose-950 ring-1 ring-rose-100";

type PaymentDueClientCardProps = {
  group: PaymentDueClientGroup;
  boughtLabel: string;
  openLabel: string;
  moreCountLabel: (count: number) => string;
  onOpen: () => void;
};

function packageSlots(packages: PaymentDuePackageLine[]): Array<PaymentDuePackageLine | null> {
  const { visible } = visiblePaymentDuePackages(packages);
  return Array.from(
    { length: PAYMENT_DUE_CARD_VISIBLE_PACKAGES },
    (_, index) => visible[index] ?? null,
  );
}

function PaymentDuePackageSlots({
  packages,
  moreCountLabel,
}: {
  packages: PaymentDuePackageLine[];
  moreCountLabel: (count: number) => string;
}) {
  const hiddenCount = visiblePaymentDuePackages(packages).hiddenCount;

  return (
    <span className="mt-1.5 flex flex-col gap-1.5">
      {packageSlots(packages).map((item, index) => (
        <span
          key={item?.packageId ?? `slot-${index}`}
          className={`${PACKAGE_SLOT_CLASS} ${item ? "" : "invisible"}`}
          aria-hidden={item ? undefined : true}
        >
          {item
            ? formatPaymentDuePurchaseLabel(item.categoryName, item.packageName)
            : "\u00a0"}
        </span>
      ))}
      <span
        className={`h-4 text-[11px] font-semibold leading-4 text-rose-600 ${hiddenCount > 0 ? "" : "invisible"}`}
      >
        {hiddenCount > 0 ? moreCountLabel(hiddenCount) : "0"}
      </span>
    </span>
  );
}

export function PaymentDueClientCard({
  group,
  boughtLabel,
  openLabel,
  moreCountLabel,
  onOpen,
}: PaymentDueClientCardProps) {
  const initial = group.clientName.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <li className="flex h-full min-w-0">
      <button
        type="button"
        className="flex h-full w-full flex-col rounded-[22px] border border-white/80 bg-gradient-to-b from-white to-rose-50/90 p-3.5 text-left shadow-[0_16px_32px_-20px_rgba(136,19,55,0.55)] ring-1 ring-white/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-18px_rgba(136,19,55,0.62)]"
        aria-label={openLabel}
        onClick={onOpen}
      >
        <span className="flex h-11 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            {initial}
          </span>
          <span className="line-clamp-2 h-10 min-w-0 font-serif text-base leading-5 text-sage-900">
            {group.clientName}
          </span>
        </span>
        <span className="mt-3.5">
          <span className="block h-4 text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-rose-500">
            {boughtLabel}
          </span>
          <PaymentDuePackageSlots
            packages={group.packages}
            moreCountLabel={moreCountLabel}
          />
        </span>
      </button>
    </li>
  );
}
