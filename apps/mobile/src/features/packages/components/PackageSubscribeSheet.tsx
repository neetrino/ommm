import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fetchGiftSpendableBalance } from "../../../lib/api/giftCardsClient";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import {
  formatPackagePriceLabel,
} from "../../../lib/packages/formatPackageDisplay";
import type { PublicPackagePlan } from "../../../lib/packages/publicPackagePlan";
import { resolvePublicPackageFinalPriceCents } from "../../../lib/packages/publicPackagePlan";
import { usePackageDisplayCopy } from "../../../lib/packages/usePackageDisplayCopy";
import { usePackagesCopy } from "../../../lib/packages/usePackagesCopy";
import { colors, space } from "../../../theme/tokens";
import { packageSubscribeSheetStyles as styles } from "./packageSubscribeSheet.styles";

type PackageSubscribeSheetProps = {
  visible: boolean;
  plan: PublicPackagePlan | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (options: { useGiftCredits: boolean }) => void;
};

export function PackageSubscribeSheet({
  visible,
  plan,
  busy,
  error,
  onClose,
  onConfirm,
}: PackageSubscribeSheetProps) {
  const packagesCopy = usePackagesCopy();
  const displayCopy = usePackageDisplayCopy();
  const tPay = useTranslations("forms.manualPackagePayment");
  const insets = useSafeAreaInsets();
  const [useGiftCredits, setUseGiftCredits] = useState(false);
  const [spendableCents, setSpendableCents] = useState(0);

  const loadGiftBalance = useCallback(async () => {
    const token = await readStoredAccessToken();
    if (token === null) {
      setSpendableCents(0);
      return;
    }
    try {
      const cents = await fetchGiftSpendableBalance(token);
      setSpendableCents(cents);
    } catch {
      setSpendableCents(0);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      setUseGiftCredits(false);
      return;
    }
    void loadGiftBalance();
  }, [loadGiftBalance, visible]);

  if (plan === null) {
    return null;
  }

  const packageName = displayCopy.formatPlanName(
    plan.name,
    plan.sessionsPerMonth,
  );
  const priceLabel = formatPackagePriceLabel({
    ...plan,
    priceCents: resolvePublicPackageFinalPriceCents(plan),
  });
  const periodLabel = tPay("periodDays", { days: plan.periodDays });
  const sessionsLabel =
    plan.sessionsPerMonth === null || plan.sessionsPerMonth <= 0
      ? tPay("unlimitedClasses")
      : tPay("sessionsPerPeriod", { count: plan.sessionsPerMonth });
  const hasGiftCredit = spendableCents > 0;
  const giftEnabled = useGiftCredits && hasGiftCredit;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={busy ? undefined : onClose}
          accessibilityRole="button"
          accessibilityLabel={tPay("closeModal")}
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, space.sm) + space.lg },
          ]}
        >
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {packagesCopy.subscribeTitle}
            </Text>
            <Pressable
              onPress={busy ? undefined : onClose}
              disabled={busy}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={tPay("closeModal")}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.warmBrown}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{tPay("selectPlanLegend")}</Text>
              <View style={styles.planCard}>
                <Text style={styles.planName}>{packageName}</Text>
                <Text style={styles.planPrice}>{priceLabel}</Text>
                <Text style={styles.planMeta}>
                  {periodLabel} · {sessionsLabel}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{tPay("giftCreditsLegend")}</Text>
              <Pressable
                disabled={busy || !hasGiftCredit}
                onPress={() => {
                  if (hasGiftCredit) {
                    setUseGiftCredits((prev) => !prev);
                  }
                }}
                style={[
                  styles.giftBlock,
                  giftEnabled && styles.giftBlockActive,
                  !hasGiftCredit && styles.giftBlockEmpty,
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: giftEnabled,
                  disabled: busy || !hasGiftCredit,
                }}
              >
                <View style={styles.giftIconWrap}>
                  <MaterialCommunityIcons
                    name="gift-outline"
                    size={20}
                    color={colors.warmBrown}
                  />
                </View>
                <View style={styles.giftCopy}>
                  <Text style={styles.giftTitle}>{tPay("useGiftCredits")}</Text>
                  <Text style={styles.giftHint}>
                    {hasGiftCredit
                      ? tPay("giftCreditsAvailableHint")
                      : tPay("giftCreditsUnavailable")}
                  </Text>
                  {hasGiftCredit ? (
                    <View style={styles.giftBadge}>
                      <Text style={styles.giftBadgeText}>
                        {formatAmdFromCents(spendableCents)}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Switch
                  value={giftEnabled}
                  disabled={busy || !hasGiftCredit}
                  onValueChange={setUseGiftCredits}
                  trackColor={{
                    false: "rgba(151, 144, 124, 0.28)",
                    true: colors.taupe,
                  }}
                  thumbColor={colors.white}
                />
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{tPay("methodLegend")}</Text>
              <View style={styles.methodOption}>
                <MaterialCommunityIcons
                  name="radiobox-marked"
                  size={20}
                  color={colors.taupe}
                />
                <Text style={styles.methodLabel}>{tPay("methods.CARD")}</Text>
              </View>
            </View>

            {error !== null ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.cancelLabel}>{tPay("cancel")}</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                onConfirm({ useGiftCredits: giftEnabled })
              }
              disabled={busy}
              style={({ pressed }) => [
                styles.confirmBtn,
                busy && styles.confirmDisabled,
                pressed && !busy && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.confirmLabel}>
                {busy ? tPay("submitting") : tPay("confirm")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
