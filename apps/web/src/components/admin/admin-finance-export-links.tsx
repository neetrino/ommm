import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";

const FINANCE_EXPORT_ICON_LINK_CLASS =
  "ommm-admin-row-icon-button inline-flex h-9 w-9 shrink-0 items-center justify-center";

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
    <div className="flex shrink-0 items-center gap-1">
      <a
        className={FINANCE_EXPORT_ICON_LINK_CLASS}
        href={`/api/v1/reports/payments.csv?from=${encodeURIComponent(fromIso)}`}
        aria-label={paymentsLabel}
        title={paymentsLabel}
      >
        <DownloadGlyph className="h-4 w-4 shrink-0" />
      </a>
      {giftCreditsLabel ? (
        <a
          className={FINANCE_EXPORT_ICON_LINK_CLASS}
          href={`/api/v1/reports/gift-credits.csv?from=${encodeURIComponent(fromIso)}`}
          aria-label={giftCreditsLabel}
          title={giftCreditsLabel}
        >
          <DownloadGlyph className="h-4 w-4 shrink-0" />
        </a>
      ) : null}
    </div>
  );
}
