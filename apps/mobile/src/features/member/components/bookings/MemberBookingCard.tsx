import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BookingMineRow } from "../../../../lib/api/memberClient";
import { formatDurationMinutes } from "../../../../lib/member/formatSessionLabels";
import { STUDIO_TIMEZONE } from "../../../../lib/studioTimezone";
import { fontFamilies } from "../../../../theme/fontFamilies";
import { platformShadow } from "../../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../../theme/tokens";
import type { MemberBookingsCopy } from "../../hooks/useMemberBookingsCopy";
import { isUpcomingMemberBooking } from "../../lib/partitionMemberBookings";
import { BookingStatusBadge } from "./BookingStatusBadge";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const META_ICON_SIZE = 32;
/** Soft stroke weight — outline glyphs at muted opacity, not heavy fill. */
const META_ICON_COLOR = "rgba(67, 72, 67, 0.42)";

function formatBookingDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: STUDIO_TIMEZONE,
  });
}

function formatBookingTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleString(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: STUDIO_TIMEZONE,
  });
}

type MetaFieldProps = {
  icon: IconName;
  label: string;
  value: string;
};

function MetaField({ icon, label, value }: MetaFieldProps) {
  return (
    <View style={styles.metaBlock}>
      <MaterialCommunityIcons
        name={icon}
        size={META_ICON_SIZE}
        color={META_ICON_COLOR}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <View style={styles.metaTextCol}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type MemberBookingCardProps = {
  booking: BookingMineRow;
  copy: MemberBookingsCopy;
};

export function MemberBookingCard({ booking, copy }: MemberBookingCardProps) {
  const { session } = booking;
  const isUpcoming = isUpcomingMemberBooking(booking);
  const coachName = session.coach.user.name?.trim() || copy.coachFallback;
  const dateLabel = formatBookingDate(session.startsAt, copy.intlLocale);
  const timeLabel = formatBookingTime(session.startsAt, copy.intlLocale);
  const durationLabel = formatDurationMinutes(
    session.startsAt,
    session.endsAt,
    copy.durationMinutes,
  );
  const statusLabel = copy.statusLabel(booking.status);

  return (
    <View style={styles.card} accessibilityLabel={session.classType.name}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{copy.sessionTypeLabel}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {session.classType.name}
          </Text>
        </View>
        <BookingStatusBadge
          status={booking.status}
          label={statusLabel}
          isUpcoming={isUpcoming}
        />
      </View>

      <View style={styles.detailsPanel}>
        <View style={styles.metaRow}>
          <MetaField
            icon="calendar-month-outline"
            label={copy.listHeaderDate}
            value={dateLabel}
          />
          <MetaField
            icon="clock-outline"
            label={copy.listHeaderTime}
            value={timeLabel}
          />
        </View>
        <View style={styles.metaRow}>
          <MetaField
            icon="timer-outline"
            label={copy.durationHeader}
            value={durationLabel}
          />
          <MetaField
            icon="account-outline"
            label={copy.coachHeader}
            value={coachName}
          />
        </View>
      </View>
    </View>
  );
}

const cardShadow = platformShadow({
  color: "#2d2823",
  offsetHeight: 14,
  opacity: 0.08,
  radius: 24,
  elevation: 3,
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.md,
    ...cardShadow,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: colors.primaryGreen,
  },
  detailsPanel: {
    gap: space.md,
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.overlayWhite20,
    backgroundColor: colors.overlayWhite10,
    padding: space.md,
  },
  detailLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  detailValue: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: "row",
    gap: space.md,
  },
  metaBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
