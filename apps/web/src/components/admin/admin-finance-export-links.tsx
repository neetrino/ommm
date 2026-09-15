import { AdminCsvExportMenu } from "@/components/admin/admin-csv-export-menu";
import { buildFinanceDateRangeQuery } from "@/components/admin/admin-finance-dates";

type AdminFinanceExportLinksProps = {
  from?: string;
  to?: string;
  menuAriaLabel: string;
  paymentsLabel: string;
  giftCreditsLabel?: string;
};

function financeExportHref(path: string, from?: string, to?: string): string {
  const query = buildFinanceDateRangeQuery({ from, to });
  return query ? `${path}?${query}` : path;
}

/** Finance CSV export — select a report, then click download to run it. */
export function AdminFinanceExportLinks({
  from,
  to,
  menuAriaLabel,
  paymentsLabel,
  giftCreditsLabel,
}: AdminFinanceExportLinksProps) {
  const items = [
    {
      href: financeExportHref("/api/v1/reports/payments.csv", from, to),
      label: paymentsLabel,
    },
    ...(giftCreditsLabel
      ? [
          {
            href: financeExportHref("/api/v1/reports/gift-credits.csv", from, to),
            label: giftCreditsLabel,
          },
        ]
      : []),
  ];

  return <AdminCsvExportMenu triggerAriaLabel={menuAriaLabel} items={items} />;
}
