import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatPackagePlanName,
  formatPackagePriceLabel,
  formatPackageValidityLabel,
  resolvePublicPackageTotalSessions,
} from "../../../lib/packages/formatPackageDisplay";
import { packagesCopy } from "../../../lib/packages/packagesCopy";
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
  onSubscribePress: () => void;
};

function MetaRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value ?? "—"}</Text>
    </View>
  );
}

function TypeSessionsBreakdown({
  rows,
}: {
  rows: ReturnType<typeof resolvePublicPackageTypeSessionRows>;
}) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <View style={styles.mixBreakdown}>
      <View style={styles.mixHeader}>
        <Text style={styles.mixHeaderCell}>{packagesCopy.typeSessionsType}</Text>
        <Text style={[styles.mixHeaderCell, styles.mixHeaderSession]}>
          {packagesCopy.typeSessionsSession}
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
  onSubscribePress,
}: PackageMobileTierCardProps) {
  const [isMixExpanded, setIsMixExpanded] = useState(false);
  const packageName = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
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
  const validityLabel = formatPackageValidityLabel(plan);
  const guestCount = plan.guestCount ?? 0;
  const guestLabel = guestCount > 0 ? String(guestCount) : null;
  const priceRowValue =
    hasDiscount && originalPrice !== null
      ? `${priceLabel} (${packagesCopy.discountBadge})`
      : priceLabel;

  return (
    <View style={styles.card} accessibilityLabel={`${categoryLabel} — ${packageName}`}>
      <View style={styles.planNameRow}>
        <Text style={styles.planName}>{packageName}</Text>
        {hasMixSessions ? (
          <Pressable
            onPress={() => setIsMixExpanded((current) => !current)}
            style={styles.mixToggle}
            accessibilityRole="button"
            accessibilityState={{ expanded: isMixExpanded }}
          >
            <MaterialCommunityIcons
              name={isMixExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#ffffff"
            />
          </Pressable>
        ) : null}
      </View>

      {isMixExpanded ? <TypeSessionsBreakdown rows={mixSessionRows} /> : null}

      <View style={styles.metaList}>
        <MetaRow label={packagesCopy.tableTotalSessions} value={totalSessionsLabel} />
        <MetaRow label={packagesCopy.tablePrice} value={priceRowValue} />
        {hasDiscount && originalPrice !== null ? (
          <MetaRow label={packagesCopy.originalPrice} value={originalPrice} />
        ) : null}
        <MetaRow label={packagesCopy.tableValidity} value={validityLabel} />
        <MetaRow label={packagesCopy.tableGuests} value={guestLabel} />
      </View>

      <Pressable
        onPress={onSubscribePress}
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
    gap: 16,
    borderRadius: PACKAGES_PAGE_MOBILE.tierCardRadiusPx,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    backgroundColor: "rgba(151, 144, 124, 0.68)",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#2d2823",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 36,
    elevation: 4,
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
    padding: 2,
  },
  mixBreakdown: {
    gap: 8,
  },
  mixHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  mixHeaderCell: {
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.78)",
  },
  mixHeaderSession: {
    textAlign: "right",
  },
  mixRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  mixType: {
    flex: 1,
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: 14,
    color: "#ffffff",
  },
  mixSession: {
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: 14,
    color: "#ffffff",
    textAlign: "right",
  },
  metaList: {
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 16,
  },
  metaLabel: {
    flexShrink: 0,
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: PACKAGES_PAGE_MOBILE.tierMetaLabelSizePx,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.78)",
  },
  metaValue: {
    flex: 1,
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: PACKAGES_PAGE_MOBILE.tierMetaValueSizePx,
    lineHeight: 20,
    color: "#ffffff",
    textAlign: "right",
  },
  subscribeButton: {
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
