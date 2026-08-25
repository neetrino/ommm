import { StyleSheet, Text, View } from "react-native";
import type { UserPaymentRow } from "../../../lib/api/paymentsClient";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  buildPaymentCardLabels,
  formatPaymentDate,
  formatPaymentTime,
  paymentStatusTone,
} from "../paymentDisplay";

type PaymentHistoryCardProps = {
  payment: UserPaymentRow;
  locale: string;
  t: (key: string) => string;
};

const STATUS_COLORS = {
  success: { bg: "rgba(187, 247, 208, 0.85)", text: "#14532d" },
  pending: { bg: "rgba(254, 243, 199, 0.9)", text: "#92400e" },
  failed: { bg: "rgba(254, 226, 226, 0.9)", text: "#991b1b" },
  refunded: { bg: "rgba(224, 242, 254, 0.9)", text: "#075985" },
  neutral: { bg: "rgba(231, 229, 228, 0.9)", text: "#44403c" },
} as const;

export function PaymentHistoryCard({
  payment,
  locale,
  t,
}: PaymentHistoryCardProps) {
  const labels = buildPaymentCardLabels(payment, t);
  const tone = paymentStatusTone(payment.status);
  const badge = STATUS_COLORS[tone];
  const dateLabel = formatPaymentDate(payment.createdAt, locale);
  const timeLabel = formatPaymentTime(payment.createdAt, locale);

  return (
    <View style={styles.card} accessibilityLabel={labels.title}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.source}>{labels.source}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {labels.title}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {labels.status}
          </Text>
        </View>
      </View>

      <Text style={styles.when}>
        {dateLabel}
        {timeLabel.length > 0 ? ` · ${timeLabel}` : ""}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.metaLabel}>{labels.amountLabel}</Text>
          <Text style={styles.amount}>
            {formatAmdFromCents(payment.amountCents)}
          </Text>
        </View>
        <View style={styles.methodBlock}>
          <Text style={styles.metaLabel}>{labels.methodLabel}</Text>
          <Text style={styles.method}>{labels.method}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: space.md,
    gap: space.sm,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 12,
      opacity: 0.12,
      radius: 18,
      elevation: 3,
    }),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  source: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.ink,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  when: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(151, 144, 124, 0.28)",
    paddingTop: space.sm,
  },
  metaLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  amount: {
    marginTop: 4,
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: 22,
    lineHeight: 26,
    color: colors.ink,
  },
  methodBlock: {
    alignItems: "flex-end",
  },
  method: {
    marginTop: 4,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
});
