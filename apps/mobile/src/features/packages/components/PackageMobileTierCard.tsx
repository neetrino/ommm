import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePackagesCopy } from "../../../lib/packages/usePackagesCopy";
import { usePackageDisplayCopy } from "../../../lib/packages/usePackageDisplayCopy";
import {
  formatPackageFreezeLabel,
  formatPackagePriceLabel,
  formatPackageValidityLabel,
  resolvePublicPackageTotalSessions,
} from "../../../lib/packages/formatPackageDisplay";
import { PACKAGES_PAGE_MOBILE } from "../../../lib/packages/packagesPageTokens";
import type { PublicPackagePlan } from "../../../lib/packages/publicPackagePlan";
import { resolvePublicPackageFinalPriceCents } from "../../../lib/packages/publicPackagePlan";
import {
  hasPublicPackageTypeSessions,
  resolvePublicPackageTypeSessionRows,
} from "../../../lib/packages/publicPackageTypeSessions";
import { fontFamilies } from "../../../theme/fontFamilies";

type PackageMobileTierCardProps = {
  categoryLabel: string;
  plan: PublicPackagePlan;
  isMixExpanded: boolean;
  onToggleMixExpand: () => void;
  onSubscribePress: (planId: string) => void;
};

function MetaRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <View style={styles.metaValueWrap}>
        <Text style={styles.metaValue}>{value ?? "—"}</Text>
      </View>
    </View>
  );
}

function TypeSessionsBreakdown({
  rows,
  typeLabel,
  sessionLabel,
}: {
  rows: ReturnType<typeof resolvePublicPackageTypeSessionRows>;
  typeLabel: string;
  sessionLabel: string;
}) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <View style={styles.mixBreakdown}>
      <View style={styles.mixHeader}>
        <Text style={styles.mixHeaderCell}>{typeLabel}</Text>
        <Text style={[styles.mixHeaderCell, styles.mixHeaderSession]}>
          {sessionLabel}
        </Text>
      </View>
      {rows.map((row) => (
        <View key={row.id} style={styles.mixRow}>
          <Text style={styles.mixType}>{row.typeName}</Text>
          <Text style={styles.mixSession}>{row.sessionCount}</Text>
        </View>
      ))}
    </View>
  );
}

export function PackageMobileTierCard({
  categoryLabel,
  plan,
  isMixExpanded,
  onToggleMixExpand,
  onSubscribePress,
}: PackageMobileTierCardProps) {
  const packagesCopy = usePackagesCopy();
  const displayCopy = usePackageDisplayCopy();
  const packageName = displayCopy.formatPlanName(plan.name, plan.sessionsPerMonth);
  const hasMixSessions = hasPublicPackageTypeSessions(plan.typeSessionAllocations);
  const mixSessionRows = resolvePublicPackageTypeSessionRows(plan.typeSessionAllocations);
  const totalSessions = resolvePublicPackageTotalSessions(plan);
  const totalSessionsLabel = plan.isUnlimited
    ? packagesCopy.sessionsUnlimitedShort
    : totalSessions !== null
      ? String(totalSessions)
      : null;
  const priceLabel = formatPackagePriceLabel({
    ...plan,
    priceCents: resolvePublicPackageFinalPriceCents(plan),
  });
  const hasDiscount =
    typeof plan.discountedPriceCents === "number" &&
    plan.discountedPriceCents > 0 &&
    plan.discountedPriceCents < plan.priceCents;
  const originalPrice = hasDiscount
    ? formatPackagePriceLabel({ ...plan, discountedPriceCents: null })
    : null;
  const validityLabel = formatPackageValidityLabel(
    plan,
    packagesCopy.formatPackageValidityDays,
  );
  const guestCount = plan.guestCount ?? 0;
  const guestLabel = guestCount > 0 ? String(guestCount) : null;
  const freezeLabel = formatPackageFreezeLabel(plan, {
    timesDays: packagesCopy.formatPackageFreeze,
  });
  const priceRowValue =
    hasDiscount && originalPrice !== null
      ? `${priceLabel} (${packagesCopy.discountBadge})`
      : priceLabel;
  const mixToggleAria = isMixExpanded
    ? packagesCopy.typeSessionsCollapseAria(packageName)
    : packagesCopy.typeSessionsExpandAria(packageName);

  return (
    <View
      style={styles.card}
      accessibilityLabel={`${categoryLabel} — ${packageName}`}
    >
      <View style={styles.planNameRow}>
        <Text style={styles.planName}>{packageName}</Text>
        {hasMixSessions ? (
          <Pressable
            onPress={onToggleMixExpand}
            style={({ pressed }) => [
              styles.mixToggle,
              pressed && styles.mixTogglePressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={mixToggleAria}
            accessibilityState={{ expanded: isMixExpanded }}
          >
            <MaterialCommunityIcons
              name={isMixExpanded ? "chevron-up" : "chevron-down"}
              size={22}
              color="#ffffff"
            />
          </Pressable>
        ) : null}
      </View>

      {isMixExpanded ? (
        <TypeSessionsBreakdown
          rows={mixSessionRows}
          typeLabel={packagesCopy.typeSessionsType}
          sessionLabel={packagesCopy.typeSessionsSession}
        />
      ) : null}

      <View style={styles.metaList}>
        <MetaRow label={packagesCopy.tableTotalSessions} value={totalSessionsLabel} />
        <MetaRow label={packagesCopy.tablePrice} value={priceRowValue} />
        {hasDiscount && originalPrice !== null ? (
          <MetaRow label={packagesCopy.originalPrice} value={originalPrice} />
        ) : null}
        <MetaRow label={packagesCopy.tableValidity} value={validityLabel} />
        <MetaRow label={packagesCopy.tableGuests} value={guestLabel} />
        <MetaRow label={packagesCopy.tableFreeze} value={freezeLabel} />
      </View>

      <Pressable
        onPress={() => onSubscribePress(plan.id)}
        style={({ pressed }) => [styles.subscribeButton, pressed && styles.subscribePressed]}
        accessibilityRole="button"
      >
        <Text style={styles.subscribeLabel}>{packagesCopy.subscribeCta}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    gap: 16,
    borderRadius: PACKAGES_PAGE_MOBILE.tierCardRadiusPx,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    backgroundColor: "rgba(151, 144, 124, 0.68)",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  planName: {
    flex: 1,
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: PACKAGES_PAGE_MOBILE.tierTitleSizePx,
    lineHeight: 26,
    letterSpacing: -0.44,
    color: "#ffffff",
  },
  mixToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  mixTogglePressed: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  mixBreakdown: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.42)",
    overflow: "hidden",
  },
  mixHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(151, 144, 124, 0.22)",
  },
  mixHeaderCell: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    color: "rgba(80, 69, 59, 0.72)",
  },
  mixHeaderSession: {
    minWidth: 56,
    textAlign: "center",
  },
  mixRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(151, 144, 124, 0.16)",
  },
  mixType: {
    flex: 1,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 13,
    color: "#1b1c1a",
  },
  mixSession: {
    minWidth: 56,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 13,
    color: "#1b1c1a",
    textAlign: "center",
  },
  metaList: {
    width: "100%",
    gap: 10,
  },
  metaRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  metaLabel: {
    flexShrink: 0,
    maxWidth: "52%",
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: PACKAGES_PAGE_MOBILE.tierMetaLabelSizePx,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.78)",
  },
  metaValueWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },
  metaValue: {
    flexShrink: 1,
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: PACKAGES_PAGE_MOBILE.tierMetaValueSizePx,
    lineHeight: 20,
    color: "#ffffff",
    textAlign: "right",
  },
  subscribeButton: {
    width: "100%",
    minHeight: PACKAGES_PAGE_MOBILE.subscribeButtonHeightPx,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "#ffffff",
  },
  subscribePressed: {
    backgroundColor: "#faf9f7",
  },
  subscribeLabel: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: PACKAGES_PAGE_MOBILE.subscribeFontSizePx,
    lineHeight: 22,
    color: "#97907c",
  },
});
