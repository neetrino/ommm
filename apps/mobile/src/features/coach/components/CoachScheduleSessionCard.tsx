import { StyleSheet, Text, View } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  formatCoachSessionDate,
  formatCoachSessionTime,
} from "../lib/coachFilters";
import { isCoachSessionOnPastDay } from "../lib/coachScheduleView";
import type { CoachPanelSessionRow } from "../types/coachPanel";

type CoachScheduleSessionCardProps = {
  session: CoachPanelSessionRow;
  locale: string;
  statusLabel: string;
  compact?: boolean;
};

export function CoachScheduleSessionCard({
  session,
  locale,
  statusLabel,
  compact = false,
}: CoachScheduleSessionCardProps) {
  const past = isCoachSessionOnPastDay(session.startsAt);

  return (
    <View style={[styles.card, past && styles.cardPast]}>
      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.meta}>
        {compact
          ? `${formatCoachSessionTime(session.startsAt, locale)}–${formatCoachSessionTime(session.endsAt, locale)}`
          : `${formatCoachSessionDate(session.startsAt, locale)} · ${formatCoachSessionTime(session.startsAt, locale)}–${formatCoachSessionTime(session.endsAt, locale)}`}
      </Text>
      <Text style={styles.meta}>
        {session.classType.name} · {statusLabel} · {session._count.bookings}/
        {session.capacity}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.md,
    gap: space.xxs,
  },
  cardPast: {
    backgroundColor: colors.badgeCream,
    borderColor: colors.glassBorder,
  },
  title: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  meta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    lineHeight: 20,
  },
});
