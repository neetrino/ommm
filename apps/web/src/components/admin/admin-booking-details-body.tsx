"use client";

import { useTranslations } from "next-intl";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import {
  DetailsCard,
  DetailsDateTime,
  DetailsField,
  DetailsFieldRow,
  DetailsStack,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  CheckCircleGlyph,
  MailGlyph,
  PhoneGlyph,
  UserGlyph,
} from "@/components/shared/details/details-glyphs";
import { GUEST_PASSES_ENABLED } from "@/lib/guest-passes";
import { displayPhoneOrFallback } from "@/lib/phone";
import { formatDateForUi } from "@/lib/date-display";
import { formatTimeForUiFromIso } from "@/lib/format-time-display";

export type AdminBookingDetailsView = {
  clientName: string;
  email: string;
  phone: string | null;
  coachName: string;
  startsAt: string;
  endsAt: string;
  bookedAt: string;
  guestName: string | null;
  packagePlan: { planName: string; sessionsPerMonth: number | null } | null;
};

/** Session card (time, coach, booked on, package) and client card (name, phone, email). */
export function AdminBookingDetailsBody({
  view,
  locale,
}: {
  view: AdminBookingDetailsView;
  locale: string;
}) {
  return (
    <DetailsStack>
      <SessionCard view={view} locale={locale} />
      <ClientCard view={view} />
    </DetailsStack>
  );
}

function SessionCard({ view, locale }: { view: AdminBookingDetailsView; locale: string }) {
  const t = useTranslations("adminPages.bookings");
  const showGuest = GUEST_PASSES_ENABLED && Boolean(view.guestName);
  const timeRange = `${formatTimeForUiFromIso(view.startsAt, locale)}–${formatTimeForUiFromIso(view.endsAt, locale)}`;

  return (
    <DetailsCard title={t("bookingDetailsSectionSession")} icon={<CalendarGlyph />}>
      <DetailsStatStrip>
        <DetailsStat label={t("bookingDetailsSessionTime")} icon={<CalendarGlyph />} tone="blue">
          <DetailsDateTime date={formatDateForUi(view.startsAt)} time={timeRange} />
        </DetailsStat>
        <DetailsStat label={t("bookingDetailsCoach")} icon={<UserGlyph />} tone="mint">
          <span className="block truncate" title={view.coachName}>
            {view.coachName}
          </span>
        </DetailsStat>
        <DetailsStat label={t("bookingDetailsBookedOn")} icon={<CheckCircleGlyph />} tone="peach">
          <DetailsDateTime
            date={formatDateForUi(view.bookedAt)}
            time={formatTimeForUiFromIso(view.bookedAt, locale)}
          />
        </DetailsStat>
      </DetailsStatStrip>
      {view.packagePlan !== null || showGuest ? (
        <DetailsFieldRow>
          {view.packagePlan !== null ? (
            <DetailsField label={t("packageInfo")} wide={!showGuest}>
              {formatPackagePlanName(view.packagePlan.planName, view.packagePlan.sessionsPerMonth)}
            </DetailsField>
          ) : null}
          {showGuest ? (
            <DetailsField label={t("bookingDetailsGuest")} wide={view.packagePlan === null}>
              {view.guestName}
            </DetailsField>
          ) : null}
        </DetailsFieldRow>
      ) : null}
    </DetailsCard>
  );
}

function ClientCard({ view }: { view: AdminBookingDetailsView }) {
  const t = useTranslations("adminPages.bookings");
  const phone = displayPhoneOrFallback(view.phone);
  return (
    <DetailsCard title={t("bookingDetailsClient")} icon={<UserGlyph />} iconTone="blue">
      <DetailsFieldRow>
        <DetailsField label={t("bookingDetailsName")} title={view.clientName}>
          {view.clientName}
        </DetailsField>
        <DetailsField label={t("bookingDetailsPhone")} icon={<PhoneGlyph />} title={phone}>
          {phone}
        </DetailsField>
        <DetailsField label={t("bookingDetailsEmail")} icon={<MailGlyph />} title={view.email} wide>
          {view.email}
        </DetailsField>
      </DetailsFieldRow>
    </DetailsCard>
  );
}
