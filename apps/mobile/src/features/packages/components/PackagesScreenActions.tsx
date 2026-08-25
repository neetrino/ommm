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
        <PackagesPrimaryCta label={actionLabel} onPress={onActionPress} />
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
  emptyCard: {
    width: "100%",
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.sm,
  },
  emptyTitle: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: scheduleColors.pageTitle,
  },
  emptyHint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: colors.bodyMuted,
    marginBottom: space.xs,
  },
});
