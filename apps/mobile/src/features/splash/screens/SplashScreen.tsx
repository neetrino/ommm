import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space } from "../../../theme/tokens";
import { useSplashSphereBounce } from "../hooks/useSplashSphereBounce";
import { splashSphereAsset } from "../splashAssets";
import {
  SPLASH_DURATION_MS,
  SPLASH_SPHERE_ASPECT_RATIO,
  SPLASH_SPHERE_LAYOUT,
  SPLASH_SPHERE_SIZE,
  SPLASH_TAGLINE_TYPOGRAPHY,
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

  const titleFontSize = Math.min(
    Math.max(
      screenWidth * SPLASH_TAGLINE_TYPOGRAPHY.fontSizeRatio,
      SPLASH_TAGLINE_TYPOGRAPHY.minFontSizePx,
    ),
    SPLASH_TAGLINE_TYPOGRAPHY.maxFontSizePx,
  );
  const titleTextStyle = {
    fontSize: titleFontSize,
    lineHeight: titleFontSize * SPLASH_TAGLINE_TYPOGRAPHY.lineHeightRatio,
    letterSpacing: titleFontSize * SPLASH_TAGLINE_TYPOGRAPHY.letterSpacingEm,
  };
  const taglineWidth = screenWidth - space.screenHorizontal * 2;

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

  return (    <View style={styles.root}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.tagline, { opacity: motion.opacity, width: taglineWidth }]}
        >
          <Text
            style={[styles.taglineLine, styles.titleLine, titleTextStyle]}
            numberOfLines={1}
            adjustsFontSizeToFit={Platform.OS === "ios"}
            minimumFontScale={SPLASH_TAGLINE_TYPOGRAPHY.minimumFontScale}
            allowFontScaling={false}
            accessibilityRole="header"
          >
            Find Your Ommm
          </Text>
          <Text
            style={[styles.taglineLine, styles.subtitleLine, titleTextStyle]}
            allowFontScaling={false}
          >
            Moment
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.sphereWrap,
            {
              width: sphereWidth,
              height: sphereHeight,
              marginTop: SPLASH_SPHERE_LAYOUT.offsetDownPx,
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
  content: {
    alignItems: "center",
    paddingHorizontal: space.screenHorizontal,
  },
  sphereWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  sphereImage: {
    width: "100%",
    height: "100%",
  },
  tagline: {
    marginBottom: space.lg,
    alignItems: "center",
    overflow: "visible",
  },
  titleLine: {
    width: "100%",
    textAlign: "center",
  },
  subtitleLine: {
    textAlign: "center",
    marginTop: Platform.OS === "ios" ? space.xs : 0,
  },
  taglineLine: {
    fontFamily: fontFamilies.gtSuperDs.bold,
    color: colors.white,
    textShadowColor: "rgba(51, 69, 55, 0.22)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    ...(Platform.OS === "ios"
      ? {
          paddingVertical: 2,
        }
      : null),
  },
});
