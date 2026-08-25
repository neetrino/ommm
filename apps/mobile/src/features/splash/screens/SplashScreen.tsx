import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import { useIsCompactChrome } from "../../../components/layout/useScreenChrome";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformTextShadow } from "../../../theme/platformShadow";
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

const SPLASH_COMPACT_OFFSET_RATIO = 0.35;
const SPLASH_COMPACT_MAX_WIDTH = 200;

export function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const compact = useIsCompactChrome();
  const { isReady, isSignedIn, homeHref } = useSession();
  const tHero = useTranslations("marketingPublic.hero");
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const motion = useSplashSphereBounce();
  const hasNavigatedRef = useRef(false);
  const [animationDone, setAnimationDone] = useState(false);

  const maxSphereWidth = compact
    ? Math.min(SPLASH_SPHERE_SIZE.maxWidthPx, SPLASH_COMPACT_MAX_WIDTH)
    : SPLASH_SPHERE_SIZE.maxWidthPx;
  const minSphereWidth = compact
    ? Math.min(SPLASH_SPHERE_SIZE.minWidthPx, 160)
    : SPLASH_SPHERE_SIZE.minWidthPx;
  const sphereWidth = Math.min(
    Math.max(screenWidth * SPLASH_SPHERE_SIZE.widthRatio, minSphereWidth),
    maxSphereWidth,
  );
  const sphereHeight = sphereWidth * SPLASH_SPHERE_ASPECT_RATIO;
  const sphereOffset = compact
    ? Math.min(
        SPLASH_SPHERE_LAYOUT.offsetDownPx * SPLASH_COMPACT_OFFSET_RATIO,
        Math.max(space.md, screenHeight * 0.06),
      )
    : SPLASH_SPHERE_LAYOUT.offsetDownPx;

  const titleFontSize = Math.min(
    Math.max(
      screenWidth * SPLASH_TAGLINE_TYPOGRAPHY.fontSizeRatio,
      compact
        ? SPLASH_TAGLINE_TYPOGRAPHY.minFontSizePx * 0.85
        : SPLASH_TAGLINE_TYPOGRAPHY.minFontSizePx,
    ),
    compact
      ? SPLASH_TAGLINE_TYPOGRAPHY.maxFontSizePx * 0.85
      : SPLASH_TAGLINE_TYPOGRAPHY.maxFontSizePx,
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

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + space.md,
            paddingBottom: insets.bottom + space.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
              {`${tHero("titleLine1")} ${tHero("brandName")}`}
            </Text>
            <Text
              style={[styles.taglineLine, styles.subtitleLine, titleTextStyle]}
              allowFontScaling={false}
            >
              {tHero("titleLine2")}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.sphereWrap,
              {
                width: sphereWidth,
                height: sphereHeight,
                marginTop: sphereOffset,
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
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
    ...platformTextShadow({
      color: "rgba(51, 69, 55, 0.22)",
      offsetHeight: 1,
      radius: 8,
    }),
    ...(Platform.OS === "ios"
      ? {
          paddingVertical: 2,
        }
      : null),
  },
});
