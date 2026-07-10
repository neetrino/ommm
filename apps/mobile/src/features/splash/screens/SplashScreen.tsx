import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { colors } from "../../../theme/tokens";
import { useSplashSphereBounce } from "../hooks/useSplashSphereBounce";
import { splashSphereAsset } from "../splashAssets";
import {
  SPLASH_DURATION_MS,
  SPLASH_SPHERE_ASPECT_RATIO,
  SPLASH_SPHERE_SIZE,
} from "../splashSphereTokens";

export function SplashScreen() {
  const router = useRouter();
  const { isReady, isSignedIn, homeHref } = useSession();
  const { width: screenWidth } = useWindowDimensions();
  const motion = useSplashSphereBounce();
  const hasNavigatedRef = useRef(false);
  const [animationDone, setAnimationDone] = useState(false);

  const sphereWidth = Math.min(
    Math.max(screenWidth * SPLASH_SPHERE_SIZE.widthRatio, SPLASH_SPHERE_SIZE.minWidthPx),
    SPLASH_SPHERE_SIZE.maxWidthPx,
  );
  const sphereHeight = sphereWidth * SPLASH_SPHERE_ASPECT_RATIO;

  useEffect(() => {
    const timer = setTimeout(() => setAnimationDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !animationDone || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace(isSignedIn ? homeHref : "/login");
  }, [animationDone, homeHref, isReady, isSignedIn, router]);

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.sphereWrap,
          {
            width: sphereWidth,
            height: sphereHeight,
            opacity: motion.opacity,
            transform: [
              { translateY: motion.translateY },
              { scaleX: motion.scaleX },
              { scaleY: motion.scaleY },
            ],
          },
        ]}
      >
        <Image
          source={splashSphereAsset}
          style={styles.sphereImage}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  sphereWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  sphereImage: {
    width: "100%",
    height: "100%",
  },
});
