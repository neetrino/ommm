import { useTranslations } from "next-intl";

export function AdminClientPackagePaymentDueBanner() {
  const t = useTranslations("adminPages.clients.packages");

  return (
    <div
      className="flex items-center gap-4 rounded-[22px] border-2 border-rose-500 bg-rose-600 px-5 py-4 text-white shadow-[0_18px_40px_-18px_rgba(190,18,60,0.55)]"
      role="status"
    >
      <PaymentDueWarningIcon />
      <div className="min-w-0 space-y-1">
        <p className="text-base font-bold uppercase tracking-[0.12em]">
          {t("paymentDue")}
        </p>
        <p className="text-sm font-medium text-rose-50">{t("paymentDueHint")}</p>
      </div>
    </div>
  );
}

export function PaymentDueWarningIcon() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-rose-600">
      <svg
        className="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 4.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    </span>
  );
}
