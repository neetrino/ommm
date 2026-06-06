type AdminFinanceExportLinksProps = {
  fromIso: string;
  paymentsLabel: string;
  giftCreditsLabel?: string;
};

export function AdminFinanceExportLinks({
  fromIso,
  paymentsLabel,
  giftCreditsLabel,
}: AdminFinanceExportLinksProps) {
  return (
    <>
      <a
        className="inline-flex rounded-xl border border-sage-300 bg-white px-3 py-2 text-xs font-medium text-sage-700"
        href={`/api/v1/reports/payments.csv?from=${encodeURIComponent(fromIso)}`}
      >
        {paymentsLabel}
      </a>
      {giftCreditsLabel ? (
        <a
          className="inline-flex rounded-xl border border-sage-300 bg-white px-3 py-2 text-xs font-medium text-sage-700"
          href={`/api/v1/reports/gift-credits.csv?from=${encodeURIComponent(fromIso)}`}
        >
          {giftCreditsLabel}
        </a>
      ) : null}
    </>
  );
}
