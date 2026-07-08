import { Platform, StyleSheet, Text, View } from "react-native";
import type { BookingMineRow } from "../../../../lib/api/memberClient";
import {
  formatDurationMinutes,
} from "../../../../lib/member/formatSessionLabels";
import { fontFamilies } from "../../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../../theme/tokens";
import type { MemberBookingsCopy } from "../../hooks/useMemberBookingsCopy";
import { isUpcomingMemberBooking } from "../../lib/partitionMemberBookings";
import { BookingStatusBadge } from "./BookingStatusBadge";

function formatBookingDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
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
  });
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
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{copy.listHeaderDate}</Text>
          <Text style={styles.detailValue}>{dateLabel}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.detailLabel}>{copy.listHeaderTime}</Text>
            <Text style={styles.metaValue}>{timeLabel}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.detailLabel}>{copy.durationHeader}</Text>
            <Text style={styles.metaValue}>{durationLabel}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{copy.coachHeader}</Text>
          <Text style={styles.detailValue}>{coachName}</Text>
        </View>
      </View>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#2d2823",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  android: { elevation: 3 },
  default: {},
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
    gap: space.sm,
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.overlayWhite20,
    backgroundColor: colors.overlayWhite10,
    padding: space.md,
  },
  detailRow: {
    gap: 4,
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
    gap: 4,
  },
  metaValue: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
});
