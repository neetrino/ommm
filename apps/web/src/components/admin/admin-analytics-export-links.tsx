import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";

const ANALYTICS_EXPORT_ICON_LINK_CLASS =
  "ommm-admin-row-icon-button inline-flex h-9 w-9 shrink-0 items-center justify-center";

type AdminAnalyticsExportLinksProps = {
  fromIso: string;
  toIso: string;
  paymentsLabel: string;
  bookingsLabel: string;
  giftCreditsLabel: string;
};

export function AdminAnalyticsExportLinks({
  fromIso,
  toIso,
  paymentsLabel,
  bookingsLabel,
  giftCreditsLabel,
}: AdminAnalyticsExportLinksProps) {
  const from = encodeURIComponent(fromIso);
  const to = encodeURIComponent(toIso);
  return (
    <div className="flex shrink-0 items-center gap-1">
      <a
        className={ANALYTICS_EXPORT_ICON_LINK_CLASS}
        href={`/api/v1/reports/payments.csv?from=${from}&to=${to}`}
        aria-label={paymentsLabel}
        title={paymentsLabel}
      >
        <DownloadGlyph className="h-4 w-4 shrink-0" />
      </a>
      <a
        className={ANALYTICS_EXPORT_ICON_LINK_CLASS}
        href={`/api/v1/reports/bookings.csv?from=${from}&to=${to}`}
        aria-label={bookingsLabel}
        title={bookingsLabel}
      >
        <DownloadGlyph className="h-4 w-4 shrink-0" />
      </a>
      <a
        className={ANALYTICS_EXPORT_ICON_LINK_CLASS}
        href={`/api/v1/reports/gift-credits.csv?from=${from}&to=${to}`}
        aria-label={giftCreditsLabel}
        title={giftCreditsLabel}
      >
        <DownloadGlyph className="h-4 w-4 shrink-0" />
      </a>
    </div>
  );
}
