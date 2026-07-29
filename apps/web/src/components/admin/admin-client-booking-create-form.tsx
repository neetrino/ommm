"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

type DropdownOption = { value: string; label: string };

type AdminClientBookingCreateFormProps = {
  formId: string;
  layout?: "stack" | "bar";
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
  submitSlot?: ReactNode;
};

const FIELD_LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-500";

const BAR_TRIGGER_CLASS =
  "w-full min-w-0 justify-between rounded-2xl border-sand-200/80 bg-white px-3.5 shadow-none";

const CLEAR_ICON_BUTTON_CLASS =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sand-200/80 bg-white text-sage-500 transition-colors hover:border-sage-300 hover:bg-sand-50 hover:text-sage-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 disabled:pointer-events-none disabled:opacity-40";

const BOOKING_MENU_MIN_WIDTH_PX = 340;

function ClearSelectionGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function AdminClientBookingCreateForm({
  formId,
  layout = "stack",
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
  submitSlot,
}: AdminClientBookingCreateFormProps) {
  const t = useTranslations("adminPages.clients");
  const isBar = layout === "bar";

  if (isBar) {
    return (
      <form
        id={formId}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1.5">
                <p className={FIELD_LABEL_CLASS}>{t("bookings.sessionLabel")}</p>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <OmmSelectDropdown
                      ariaLabel={t("bookings.selectSession")}
                      label={t("bookings.selectSession")}
                      value={sessionId}
                      options={sessionOptions}
                      onChange={onSessionChange}
                      disabled={disabled}
                      searchable
                      searchPlaceholder={t("bookings.searchSessions")}
                      noResultsLabel={t("bookings.searchNoResults")}
                      wrapMenuLabel
                      menuMinWidth={BOOKING_MENU_MIN_WIDTH_PX}
                      toggleDeselectValue=""
                      triggerClassName={BAR_TRIGGER_CLASS}
                      menuClassName="max-w-[min(28rem,calc(100vw-2rem))]"
                    />
                  </div>
                  {sessionId !== "" ? (
                    <button
                      type="button"
                      className={CLEAR_ICON_BUTTON_CLASS}
                      aria-label={t("bookings.clearSession")}
                      title={t("bookings.clearSession")}
                      disabled={disabled}
                      onClick={() => onSessionChange("")}
                    >
                      <ClearSelectionGlyph className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="min-w-0 space-y-1.5">
                <p className={FIELD_LABEL_CLASS}>{t("bookings.packageLabel")}</p>
                {sessionId === "" ? (
                  <div className="flex min-h-11 items-center rounded-2xl border border-dashed border-sand-200/90 bg-sand-50/50 px-3.5 text-sm text-sage-400">
                    {t("bookings.packageAfterSession")}
                  </div>
                ) : null}
                {sessionId !== "" && packagesLoading ? (
                  <div className="flex min-h-11 items-center rounded-2xl border border-sand-200/70 bg-white px-3.5 text-sm text-sage-500">
                    {t("bookings.packagesLoading")}
                  </div>
                ) : null}
                {sessionId !== "" && !packagesLoading && packagesError !== null ? (
                  <p className="text-sm text-rose-700">{packagesError}</p>
                ) : null}
                {sessionId !== "" &&
                !packagesLoading &&
                packagesError === null &&
                bookablePackageCount === 0 ? (
                  <div className="flex min-h-11 items-center rounded-2xl border border-sand-200/70 bg-white px-3.5 text-sm text-sage-600">
                    {packageRequired
                      ? t("bookings.packagesEmptyRequired")
                      : t("bookings.packagesEmptyOptional")}
                  </div>
                ) : null}
                {sessionId !== "" && !packagesLoading && bookablePackageCount > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <OmmSelectDropdown
                        ariaLabel={t("bookings.selectPackage")}
                        label={
                          packageRequired
                            ? t("bookings.selectPackage")
                            : t("bookings.selectPackageOptional")
                        }
                        value={userPackageId}
                        options={packageOptions}
                        onChange={onPackageChange}
                        disabled={disabled}
                        searchable={packageOptions.length > 5}
                        searchPlaceholder={t("bookings.searchPackages")}
                        noResultsLabel={t("bookings.searchNoResults")}
                        wrapMenuLabel
                        menuMinWidth={BOOKING_MENU_MIN_WIDTH_PX}
                        toggleDeselectValue={noPackageValue}
                        triggerClassName={BAR_TRIGGER_CLASS}
                        menuClassName="max-w-[min(28rem,calc(100vw-2rem))]"
                      />
                    </div>
                    {userPackageId !== noPackageValue ? (
                      <button
                        type="button"
                        className={CLEAR_ICON_BUTTON_CLASS}
                        aria-label={t("bookings.clearPackage")}
                        title={t("bookings.clearPackage")}
                        disabled={disabled}
                        onClick={() => onPackageChange(noPackageValue)}
                      >
                        <ClearSelectionGlyph className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {submitSlot !== undefined ? (
              <div className="shrink-0 lg:pb-0.5">{submitSlot}</div>
            ) : null}
          </div>
        ) : null}
      </form>
    );
  }

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
          <OmmSelectDropdown
            ariaLabel={t("bookings.selectSession")}
            label={t("bookings.selectSession")}
            value={sessionId}
            options={sessionOptions}
            onChange={onSessionChange}
            disabled={disabled}
            wrapLabel
            wrapMenuLabel
            toggleDeselectValue=""
          />
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
            <OmmSelectDropdown
              ariaLabel={t("bookings.selectPackage")}
              label={
                packageRequired
                  ? t("bookings.selectPackage")
                  : t("bookings.selectPackageOptional")
              }
              value={userPackageId}
              options={packageOptions}
              onChange={onPackageChange}
              disabled={disabled}
              wrapLabel
              wrapMenuLabel
              toggleDeselectValue={noPackageValue}
            />
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
