import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { PACKAGES_PRIMARY_CTA } from "../../../lib/packages/packagesPageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { scheduleColors } from "../../schedule/scheduleTokens";

const BROWSE_CTA_ICON_SIZE_PX = 22;
const BROWSE_CTA_MAX_WIDTH_PX = 340;
const BROWSE_CTA_MIN_HEIGHT_PX = 56;

type PackagesPrimaryCtaProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  style?: StyleProp<ViewStyle>;
};

export function PackagesPrimaryCta({
  label,
  onPress,
  variant = "primary",
  style,
}: PackagesPrimaryCtaProps) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        isPrimary ? styles.primary : styles.ghost,
        isPrimary && pressed && styles.primaryPressed,
        !isPrimary && pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={isPrimary ? styles.primaryLabel : styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

type PackagesBrowseCatalogCtaProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Purchase-intent CTA — centered, icon + label, distinct from header taupe pills. */
export function PackagesBrowseCatalogCta({
  label,
  onPress,
  style,
}: PackagesBrowseCatalogCtaProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.browseCta,
        pressed && styles.browseCtaPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={label}
    >
      <View style={styles.browseCtaIconWrap}>
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={BROWSE_CTA_ICON_SIZE_PX}
          color={colors.white}
        />
      </View>
      <Text style={styles.browseCtaLabel} numberOfLines={2}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={colors.white}
      />
    </Pressable>
  );
}

type PackagesEmptyStateProps = {
  title: string;
  hint?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function PackagesEmptyState({
  title,
  hint,
  actionLabel,
  onActionPress,
}: PackagesEmptyStateProps) {
  const showHint = hint !== undefined && hint.trim().length > 0;
  const showAction =
    actionLabel !== undefined &&
    actionLabel.trim().length > 0 &&
    onActionPress !== undefined;

  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {showHint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
      {showAction ? (
        <PackagesBrowseCatalogCta
          label={actionLabel}
          onPress={onActionPress}
          style={styles.emptyAction}
        />
      ) : null}
    </View>
  );
}

const primaryShadow = platformShadow({
  color: PACKAGES_PRIMARY_CTA.shadowColor,
  offsetHeight: PACKAGES_PRIMARY_CTA.shadowOffsetHeightPx,
  opacity: PACKAGES_PRIMARY_CTA.shadowOpacity,
  radius: PACKAGES_PRIMARY_CTA.shadowRadiusPx,
  elevation: PACKAGES_PRIMARY_CTA.androidElevation,
});

const browseCtaShadow = platformShadow({
  color: "#1a1c1b",
  offsetHeight: 10,
  opacity: 0.28,
  radius: 18,
  elevation: 5,
});

const styles = StyleSheet.create({
  primary: {
    alignSelf: "flex-start",
    minHeight: PACKAGES_PRIMARY_CTA.minHeightPx,
    paddingHorizontal: PACKAGES_PRIMARY_CTA.paddingHorizontalPx,
    paddingVertical: PACKAGES_PRIMARY_CTA.paddingVerticalPx,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.taupe,
    ...primaryShadow,
  },
  primaryPressed: {
    backgroundColor: colors.warmBrown,
    opacity: 0.96,
  },
  ghost: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: space.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
  },
  pressed: {
    opacity: 0.9,
  },
  primaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: PACKAGES_PRIMARY_CTA.fontSizePx,
    letterSpacing: PACKAGES_PRIMARY_CTA.letterSpacingPx,
    textTransform: "uppercase",
    color: colors.white,
  },
  ghostLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  browseCta: {
    alignSelf: "center",
    width: "100%",
    maxWidth: BROWSE_CTA_MAX_WIDTH_PX,
    minHeight: BROWSE_CTA_MIN_HEIGHT_PX,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.sm,
    paddingLeft: space.sm,
    paddingRight: space.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
    ...browseCtaShadow,
  },
  browseCtaPressed: {
    backgroundColor: colors.warmBrown,
    opacity: 0.96,
  },
  browseCtaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlayWhite20,
  },
  browseCtaLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: colors.white,
    textAlign: "left",
  },
  emptyCard: {
    width: "100%",
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.md,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: scheduleColors.pageTitle,
    textAlign: "center",
  },
  emptyHint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: colors.bodyMuted,
    textAlign: "center",
    maxWidth: 320,
  },
  emptyAction: {
    marginTop: space.xs,
  },
});
