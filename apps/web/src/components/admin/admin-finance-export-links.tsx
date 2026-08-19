import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";
import { buildFinanceDateRangeQuery } from "@/components/admin/admin-finance-dates";

const FINANCE_EXPORT_ICON_LINK_CLASS =
  "ommm-admin-row-icon-button inline-flex h-9 w-9 shrink-0 items-center justify-center";

type AdminFinanceExportLinksProps = {
  from?: string;
  to?: string;
  paymentsLabel: string;
  giftCreditsLabel?: string;
};

function financeExportHref(path: string, from?: string, to?: string): string {
  const query = buildFinanceDateRangeQuery({ from, to });
  return query ? `${path}?${query}` : path;
}

export function AdminFinanceExportLinks({
  from,
  to,
  paymentsLabel,
  giftCreditsLabel,
}: AdminFinanceExportLinksProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <a
        className={FINANCE_EXPORT_ICON_LINK_CLASS}
        href={financeExportHref("/api/v1/reports/payments.csv", from, to)}
        aria-label={paymentsLabel}
        title={paymentsLabel}
      >
        <DownloadGlyph className="h-4 w-4 shrink-0" />
      </a>
      {giftCreditsLabel ? (
        <a
          className={FINANCE_EXPORT_ICON_LINK_CLASS}
          href={financeExportHref("/api/v1/reports/gift-credits.csv", from, to)}
          aria-label={giftCreditsLabel}
          title={giftCreditsLabel}
        >
          <DownloadGlyph className="h-4 w-4 shrink-0" />
        </a>
      ) : null}
    </div>
  );
}
