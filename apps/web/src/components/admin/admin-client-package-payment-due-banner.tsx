import { useTranslations } from "next-intl";

export function AdminClientPackagePaymentDueBanner() {
  const t = useTranslations("adminPages.clients.packages");

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-rose-900"
      role="status"
    >
      <PaymentDueWarningIcon />
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-semibold uppercase tracking-[0.08em]">
          {t("paymentDue")}
        </p>
        <p className="text-sm font-medium text-rose-800">{t("paymentDueHint")}</p>
      </div>
    </div>
  );
}

function PaymentDueWarningIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-rose-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}
