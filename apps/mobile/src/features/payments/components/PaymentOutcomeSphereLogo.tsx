import { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { splashSphereAsset } from "../../splash/splashAssets";
import { PAYMENT_OUTCOME_SPHERE } from "../paymentOutcomeTokens";

type PaymentOutcomeSphereLogoProps = {
  alt: string;
  homeAriaLabel: string;
};

/**
 * Brand sphere on payment outcome — mirrors web `PaymentOutcomeSphereLogo`
 * (footer illustration + soft bounce, links home).
 */
export function PaymentOutcomeSphereLogo({
  alt,
  homeAriaLabel,
}: PaymentOutcomeSphereLogoProps) {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let loop: Animated.CompositeAnimation | null = null;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) {
        return;
      }
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
      if (reduceMotion) {
        return;
      }
      const peak = PAYMENT_OUTCOME_SPHERE.bouncePeakPx;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -peak,
            duration: 620,
            easing: Easing.bezier(0.12, 0.84, 0.22, 1),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 640,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
    });

    return () => {
      cancelled = true;
      loop?.stop();
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [opacity, translateY]);

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
          { opacity, transform: [{ translateY }] },
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
      PAYMENT_OUTCOME_SPHERE.heightPx + PAYMENT_OUTCOME_SPHERE.bounceDropPadPx,
    marginBottom: 4,
  },
  frame: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: PAYMENT_OUTCOME_SPHERE.bounceDropPadPx,
    height: PAYMENT_OUTCOME_SPHERE.heightPx,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
