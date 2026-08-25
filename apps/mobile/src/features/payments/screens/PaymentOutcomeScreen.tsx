import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { useTranslations } from "../../../i18n/I18nProvider";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  paymentCheckoutReturnPath,
  type PaymentCheckoutSource,
  type PaymentOutcomeKind,
} from "../../../lib/payments/paymentCheckoutSource";

type PaymentOutcomeScreenProps = {
  outcome: PaymentOutcomeKind;
  source: PaymentCheckoutSource;
  reference: string | null;
};

const ICON_RING = {
  success: {
    bg: "rgba(209, 250, 229, 0.92)",
    border: "rgba(167, 243, 208, 0.85)",
    icon: "#065f46" as const,
    name: "check-circle-outline" as const,
  },
  failed: {
    bg: "rgba(254, 226, 226, 0.92)",
    border: "rgba(254, 202, 202, 0.9)",
    icon: "#991b1b" as const,
    name: "close-circle-outline" as const,
  },
  pending: {
    bg: "rgba(254, 243, 199, 0.92)",
    border: "rgba(253, 230, 138, 0.9)",
    icon: "#92400e" as const,
    name: "clock-outline" as const,
  },
} as const;

export function PaymentOutcomeScreen({
  outcome,
  source,
  reference,
}: PaymentOutcomeScreenProps) {
  const router = useRouter();
  const t = useTranslations("userPages.payments.result");
  const tCheckout = useTranslations("userPages.payments.checkout");
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
    useScreenChromeInsets({ header: "safe", contentGap: space.lg });

  const isSuccess = outcome === "success";
  const isPending = outcome === "pending";
  const titleKey = isSuccess
    ? "successTitle"
    : isPending
      ? "pendingTitle"
      : "failedTitle";
  const leadKey = isSuccess
    ? "successLead"
    : isPending
      ? "pendingLead"
      : "failedLead";
  const ring = ICON_RING[outcome];
  const returnPath = paymentCheckoutReturnPath(source);

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <View
        style={[
          styles.content,
          { paddingTop, paddingBottom, paddingLeft, paddingRight },
        ]}
      >
        <View style={styles.panel}>
          <View
            style={[
              styles.iconRing,
              { backgroundColor: ring.bg, borderColor: ring.border },
            ]}
          >
            <MaterialCommunityIcons
              name={ring.name}
              size={36}
              color={ring.icon}
            />
          </View>

          <Text style={styles.eyebrow}>
            {tCheckout(`sources.${source}.eyebrow`)}
          </Text>
          <Text style={styles.title}>
            {t(`sources.${source}.${titleKey}`)}
          </Text>
          <Text style={styles.lead}>{t(`sources.${source}.${leadKey}`)}</Text>

          {reference !== null ? (
            <Text style={styles.reference}>
              {t("referenceLabel")}: {reference}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <PackagesPrimaryCta
              label={t("doneButton")}
              onPress={() => router.replace(returnPath)}
            />
            {!isSuccess && !isPending ? (
              <Pressable
                onPress={() => router.replace(returnPath)}
                style={({ pressed }) => [
                  styles.retryGhost,
                  pressed && styles.retryGhostPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("retryButton")}
              >
                <Text style={styles.retryLabel}>{t("retryButton")}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  panel: {
    borderRadius: radii.cardInner,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    alignItems: "center",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 18,
      opacity: 0.18,
      radius: 28,
      elevation: 5,
    }),
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    marginTop: space.lg,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.bodyMuted,
    textAlign: "center",
  },
  title: {
    marginTop: space.sm,
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: colors.ink,
    textAlign: "center",
  },
  lead: {
    marginTop: space.sm,
    maxWidth: 320,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.bodyMuted,
    textAlign: "center",
  },
  reference: {
    marginTop: space.md,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.warmBrown,
    textAlign: "center",
  },
  actions: {
    marginTop: space.xl,
    width: "100%",
    gap: space.sm,
  },
  retryGhost: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  retryGhostPressed: {
    opacity: 0.75,
  },
  retryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    color: colors.primaryGreen,
  },
});
