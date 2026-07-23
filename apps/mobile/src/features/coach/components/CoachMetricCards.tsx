import { StyleSheet, Text, View } from "react-native";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type CoachMetricCardProps = {
  label: string;
  value: string;
};

export function CoachMetricCard({ label, value }: CoachMetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

type CoachStateCardProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function CoachStateCard({
  message,
  actionLabel,
  onAction,
}: CoachStateCardProps) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateMessage}>{message}</Text>
      {actionLabel && onAction ? (
        <PackagesPrimaryCta label={actionLabel} onPress={onAction} variant="ghost" />
      ) : null}
    </View>
  );
}

type CoachShortcutCardProps = {
  title: string;
  subtitle?: string;
  actionLabel: string;
  onPress: () => void;
};

export function CoachShortcutCard({
  title,
  subtitle,
  actionLabel,
  onPress,
}: CoachShortcutCardProps) {
  return (
    <View style={styles.shortcutCard}>
      <Text style={styles.shortcutTitle}>{title}</Text>
      {subtitle ? <Text style={styles.shortcutSubtitle}>{subtitle}</Text> : null}
      <PackagesPrimaryCta label={actionLabel} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 96,
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.md,
    gap: space.xs,
  },
  label: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  value: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  stateCard: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(139, 46, 46, 0.18)",
    padding: space.lg,
    gap: space.md,
  },
  stateMessage: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: colors.warmBrown,
  },
  shortcutCard: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.lg,
    gap: space.sm,
  },
  shortcutTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  shortcutSubtitle: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    lineHeight: 20,
  },
});
