import { StyleSheet, Text, View } from "react-native";
import { PackagesPrimaryCta } from "../../../packages/components/PackagesScreenActions";
import { fontFamilies } from "../../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../../theme/tokens";
import { scheduleColors } from "../../../schedule/scheduleTokens";

type BookingsEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function BookingsEmptyState({
  title,
  description,
  actionLabel,
  onActionPress,
}: BookingsEmptyStateProps) {
  const showAction =
    actionLabel !== undefined &&
    actionLabel.trim().length > 0 &&
    onActionPress !== undefined;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {showAction ? (
        <PackagesPrimaryCta label={actionLabel} onPress={onActionPress} />
      ) : null}
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
    gap: space.sm,
    alignItems: "flex-start",
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle + 2,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: scheduleColors.pageTitle,
  },
  description: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: colors.bodyMuted,
    marginBottom: space.xs,
  },
});
