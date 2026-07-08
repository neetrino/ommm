import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { packagesCopy } from "../../../lib/packages/packagesCopy";
import {
  formatPackagePlanName,
  formatPackagePriceLabel,
  formatPackageValidityLabel,
} from "../../../lib/packages/formatPackageDisplay";
import type { PublicPackagePlan } from "../../../lib/packages/publicPackagePlan";
import { resolvePublicPackageFinalPriceCents } from "../../../lib/packages/publicPackagePlan";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type PackageSubscribeSheetProps = {
  visible: boolean;
  plan: PublicPackagePlan | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function PackageSubscribeSheet({
  visible,
  plan,
  busy,
  error,
  onClose,
  onConfirm,
}: PackageSubscribeSheetProps) {
  if (plan === null) {
    return null;
  }

  const packageName = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
  const priceLabel = formatPackagePriceLabel({
    ...plan,
    priceCents: resolvePublicPackageFinalPriceCents(plan),
  });
  const validityLabel = formatPackageValidityLabel(plan);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={busy ? undefined : onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{packagesCopy.subscribeTitle}</Text>
          <Text style={styles.planName}>{packageName}</Text>
          <View style={styles.metaList}>
            <Text style={styles.metaLine}>{priceLabel}</Text>
            {validityLabel !== null ? (
              <Text style={styles.metaMuted}>{validityLabel}</Text>
            ) : null}
          </View>
          {error !== null ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryLabel}>{packagesCopy.detailsClose}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={busy}
              style={({ pressed }) => [
                styles.primaryButton,
                busy && styles.primaryDisabled,
                pressed && !busy && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryLabel}>
                {busy ? packagesCopy.loading : packagesCopy.subscribeConfirm}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radii.labelCard,
    borderTopRightRadius: radii.labelCard,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xl,
    gap: space.md,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen80,
  },
  planName: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  metaList: {
    gap: 4,
  },
  metaLine: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.sectionTitle - 4,
    color: colors.ink,
  },
  metaMuted: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.sm,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: space.lg,
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
    fontSize: typography.body,
    color: colors.white,
  },
  secondaryLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
});
