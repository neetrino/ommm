import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { useTranslations } from "../../../i18n/I18nProvider";
import { platformShadow } from "../../../theme/platformShadow";
import { space } from "../../../theme/tokens";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import {
  paymentCheckoutReturnPath,
  type PaymentCheckoutSource,
  type PaymentOutcomeKind,
} from "../../../lib/payments/paymentCheckoutSource";
import {
  PAYMENT_OUTCOME_ICON_RING,
  PAYMENT_OUTCOME_PANEL_GRADIENT,
} from "../paymentOutcomeTokens";
import { PaymentOutcomeSphereLogo } from "../components/PaymentOutcomeSphereLogo";
import { paymentOutcomeScreenStyles as styles } from "../components/paymentOutcomeScreen.styles";

type PaymentOutcomeScreenProps = {
  outcome: PaymentOutcomeKind;
  source: PaymentCheckoutSource;
  reference: string | null;
};

const ICON_NAME = {
  success: "check-circle-outline",
  failed: "close-circle-outline",
  pending: "clock-outline",
} as const;

export function PaymentOutcomeScreen({
  outcome,
  source,
  reference: _reference,
}: PaymentOutcomeScreenProps) {
  const router = useRouter();
  const t = useTranslations("userPages.payments.result");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tCheckout = useTranslations("userPages.payments.checkout");
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
    useScreenChromeInsets({
      header: "safe",
      tabBar: false,
      contentGap: space.lg,
    });

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
  const ring = PAYMENT_OUTCOME_ICON_RING[outcome];
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
          <LinearGradient
            colors={[...PAYMENT_OUTCOME_PANEL_GRADIENT]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.panelInner}
          />
          <View style={styles.panelBody}>
            <PaymentOutcomeSphereLogo
              alt={tCommon("brand")}
              homeAriaLabel={tNav("home")}
            />

            <View
              style={[
                styles.iconRing,
                { borderColor: ring.border },
                platformShadow({
                  color: ring.shadow,
                  offsetHeight: 18,
                  opacity: 0.35,
                  radius: 20,
                  elevation: 4,
                }),
              ]}
            >
              <LinearGradient
                colors={[...ring.gradient]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.iconRingFill}
              />
              <MaterialCommunityIcons
                name={ICON_NAME[outcome]}
                size={PAYMENT_OUTCOME_ICON_RING.glyphSizePx}
                color={ring.icon}
              />
            </View>

            <Text style={styles.eyebrow}>
              {tCheckout(`sources.${source}.eyebrow`)}
            </Text>
            <Text style={styles.title}>
              {t(`sources.${source}.${titleKey}`)}
            </Text>
            <Text style={styles.lead}>
              {t(`sources.${source}.${leadKey}`)}
            </Text>

            <View style={styles.actions}>
              <PackagesPrimaryCta
                label={t("doneButton")}
                onPress={() => router.replace(returnPath)}
                style={styles.doneCta}
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
    </View>
  );
}
