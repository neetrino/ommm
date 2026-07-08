import { StyleSheet, Text, View } from "react-native";
import { usePackagesCopy } from "../../../lib/packages/usePackagesCopy";
import { usePackageDisplayCopy } from "../../../lib/packages/usePackageDisplayCopy";
import { formatPackagePriceLabel } from "../../../lib/packages/formatPackageDisplay";
import { useMembershipLabels } from "../../../lib/packages/useMembershipLabels";
import type { UserMembershipRow, UserPackageStatus } from "../../../lib/packages/userMembership";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type UserMembershipCardProps = {
  membership: UserMembershipRow;
  status: UserPackageStatus;
};

function statusColors(status: UserPackageStatus): { bg: string; border: string; text: string } {
  if (status === "ACTIVE") {
    return { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" };
  }
  if (status === "PENDING") {
    return { bg: "#fffbeb", border: "#fde68a", text: "#92400e" };
  }
  if (status === "PAUSED") {
    return { bg: "#faf9f7", border: "#d6d3d1", text: colors.secondarySage };
  }
  if (status === "EXPIRED") {
    return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };
  }
  return { bg: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.7)", text: colors.secondarySage };
}

export function UserMembershipCard({ membership, status }: UserMembershipCardProps) {
  const packagesCopy = usePackagesCopy();
  const displayCopy = usePackageDisplayCopy();
  const labels = useMembershipLabels();
  const sessionName = displayCopy.formatPlanName(
    membership.plan.name,
    membership.plan.sessionsPerMonth,
  );
  const priceLabel = formatPackagePriceLabel({
    priceCents: membership.plan.priceCents,
    discountedPriceCents: null,
  });
  const validityLabel = labels.formatValidityLabel(membership);
  const sessionsSummary = labels.formatSessionsSummary(membership);
  const badge = statusColors(status);

  return (
    <View style={styles.card} accessibilityLabel={`${membership.plan.categoryName} — ${sessionName}`}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.category}>{membership.plan.categoryName}</Text>
          <Text style={styles.title}>{sessionName}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <Text style={[styles.badgeLabel, { color: badge.text }]}>
            {labels.formatStatusLabel(status)}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sessions}>{sessionsSummary}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>{packagesCopy.membershipDetailsPrice}</Text>
            <Text style={styles.metaValue}>{priceLabel}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>{packagesCopy.membershipDetailsValidity}</Text>
            <Text style={styles.metaValue}>{validityLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.md,
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
  category: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 32,
    color: colors.primaryGreen,
  },
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  body: {
    gap: space.md,
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.overlayWhite20,
    backgroundColor: colors.overlayWhite10,
    padding: space.md,
  },
  sessions: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.md,
  },
  metaBlock: {
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  metaValue: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.ink,
  },
});
