import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { formatAmdFromCents } from "@/lib/price-amd";

type UserGiftCardsBalanceDisplayProps = {
  label: string;
  amountCents: number;
  locale: string;
};

/** Compact inline gift credit balance for the page hero. */
export function UserGiftCardsBalanceDisplay({
  label,
  amountCents,
  locale,
}: UserGiftCardsBalanceDisplayProps) {
  const amountLabel = formatAmdFromCents(amountCents, locale);

  return (
    <div
      className="ml-auto flex shrink-0 items-center gap-2.5 rounded-full border border-white/75 bg-white/88 px-3 py-2 shadow-[0_12px_28px_-16px_rgba(45,40,35,0.24)] backdrop-blur-sm sm:px-4"
      aria-label={`${label}: ${amountLabel}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-100/95 text-sage-700">
        <DashboardNavIcon name="wallet" className="h-4 w-4" />
      </span>
      <p className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {label}
        </span>
        <span className="font-serif text-xl tabular-nums leading-none tracking-tight text-sage-950 sm:text-[1.35rem]">
          {amountLabel}
        </span>
      </p>
    </div>
  );
}
