"use client";

import { useTranslations } from "next-intl";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";

type DropdownOption = { value: string; label: string };

type AdminClientBookingCreateFormProps = {
  formId: string;
  sessionsLoading: boolean;
  sessionsError: string | null;
  sessionOptions: DropdownOption[];
  sessionId: string;
  onSessionChange: (value: string) => void;
  packagesLoading: boolean;
  packagesError: string | null;
  packageOptions: DropdownOption[];
  userPackageId: string;
  onPackageChange: (value: string) => void;
  packageRequired: boolean;
  noPackageValue: string;
  bookablePackageCount: number;
  disabled: boolean;
  onSubmit: () => void;
};

export function AdminClientBookingCreateForm({
  formId,
  sessionsLoading,
  sessionsError,
  sessionOptions,
  sessionId,
  onSessionChange,
  packagesLoading,
  packagesError,
  packageOptions,
  userPackageId,
  onPackageChange,
  packageRequired,
  noPackageValue,
  bookablePackageCount,
  disabled,
  onSubmit,
}: AdminClientBookingCreateFormProps) {
  const t = useTranslations("adminPages.clients");

  return (
    <form
      id={formId}
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm text-sage-600">{t("bookings.selectLead")}</p>

      {sessionsLoading ? (
        <p className="text-sm text-sage-600">{t("bookings.sessionsLoading")}</p>
      ) : null}
      {!sessionsLoading && sessionsError !== null ? (
        <p className="text-sm text-rose-700">{sessionsError}</p>
      ) : null}
      {!sessionsLoading && sessionsError === null && sessionOptions.length === 0 ? (
        <p className="text-sm text-sage-600">{t("bookings.sessionsEmpty")}</p>
      ) : null}

      {!sessionsLoading && sessionOptions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
            {t("bookings.sessionLabel")}
          </p>
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <OmmFilterDropdown
                allValue=""
                value={sessionId}
                ariaLabel={t("bookings.selectSession")}
                allLabel={t("bookings.selectSession")}
                onChange={onSessionChange}
                options={sessionOptions}
                disabled={disabled}
                wrapLabel
              />
            </div>
            {sessionId !== "" ? (
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sage-200/80 bg-white text-sage-500 shadow-sm transition-colors hover:border-sage-300 hover:bg-sage-50 hover:text-sage-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 disabled:pointer-events-none disabled:opacity-50"
                aria-label={t("bookings.clearSession")}
                title={t("bookings.clearSession")}
                disabled={disabled}
                onClick={() => onSessionChange("")}
              >
                <ClearSessionGlyph className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {sessionId !== "" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
            {t("bookings.packageLabel")}
          </p>
          {packagesLoading ? (
            <p className="text-sm text-sage-600">{t("bookings.packagesLoading")}</p>
          ) : null}
          {!packagesLoading && packagesError !== null ? (
            <p className="text-sm text-rose-700">{packagesError}</p>
          ) : null}
          {!packagesLoading && packagesError === null && bookablePackageCount === 0 ? (
            <p className="text-sm text-sage-600">
              {packageRequired
                ? t("bookings.packagesEmptyRequired")
                : t("bookings.packagesEmptyOptional")}
            </p>
          ) : null}
          {!packagesLoading && bookablePackageCount > 0 ? (
            <OmmFilterDropdown
              allValue={noPackageValue}
              value={userPackageId}
              ariaLabel={t("bookings.selectPackage")}
              allLabel={
                packageRequired
                  ? t("bookings.selectPackage")
                  : t("bookings.selectPackageOptional")
              }
              onChange={onPackageChange}
              options={packageOptions}
              disabled={disabled}
              wrapLabel
            />
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
