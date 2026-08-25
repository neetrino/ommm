import { Animated, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { splashSphereAsset } from "../../splash/splashAssets";
import { usePaymentOutcomeSphereBounce } from "../hooks/usePaymentOutcomeSphereBounce";
import {
  PAYMENT_OUTCOME_SPHERE,
  PAYMENT_OUTCOME_SPHERE_BOUNCE,
} from "../paymentOutcomeTokens";

type PaymentOutcomeSphereLogoProps = {
  alt: string;
  homeAriaLabel: string;
};

/**
 * Brand sphere on payment outcome — mirrors web `PaymentOutcomeSphereLogo`
 * (footer illustration + WAAPI-equivalent bounce, links home).
 */
export function PaymentOutcomeSphereLogo({
  alt,
  homeAriaLabel,
}: PaymentOutcomeSphereLogoProps) {
  const router = useRouter();
  const motion = usePaymentOutcomeSphereBounce();

  return (
    <Pressable
      onPress={() => router.replace("/user/home")}
      accessibilityRole="link"
      accessibilityLabel={homeAriaLabel}
      style={styles.stage}
    >
      <Animated.View
        style={[
          styles.frame,
          {
            opacity: motion.opacity,
            transform: [
              { translateX: motion.translateX },
              { translateY: motion.translateY },
              { scaleX: motion.scaleX },
              { scaleY: motion.scaleY },
            ],
          },
        ]}
      >
        <Image
          source={splashSphereAsset}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={alt}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignSelf: "center",
    width: PAYMENT_OUTCOME_SPHERE.widthPx,
    height:
      PAYMENT_OUTCOME_SPHERE.heightPx + PAYMENT_OUTCOME_SPHERE_BOUNCE.maxDropPx,
    marginBottom: 4,
    overflow: "visible",
  },
  frame: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: PAYMENT_OUTCOME_SPHERE_BOUNCE.maxDropPx,
    height: PAYMENT_OUTCOME_SPHERE.heightPx,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
