import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type AppHeaderProps = {
  onBookPress: () => void;
};

export function AppHeader({ onBookPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingTop: insets.top }]}
    >
      <BlurView intensity={40} tint="light" style={styles.blur}>
        <View style={styles.row}>
          <View style={styles.logoSlot}>
            <View style={styles.logoWrap} accessibilityLabel="Ommm logo">
              <Image
                source={figmaRemoteAssets.brandMark}
                style={styles.logo}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
            </View>
          </View>
          <Pressable
            onPress={onBookPress}
            style={({ pressed }) => [
              styles.bookButton,
              pressed && styles.bookButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Book now"
          >
            <Text style={styles.bookLabel}>BOOK NOW</Text>
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

const LOGO_SIZE = 96;
/** Bar height stays at original compact strip; logo can draw larger via overflow. */
const HEADER_ROW_MIN_HEIGHT = 50 + space.xs;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderBottomLeftRadius: radii.header,
    borderBottomRightRadius: radii.header,
    overflow: "hidden",
    backgroundColor: colors.overlayWhite35,
  },
  blur: {
    paddingHorizontal: space.screenHorizontal,
    paddingBottom: space.md,
    overflow: "visible",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: HEADER_ROW_MIN_HEIGHT,
    overflow: "visible",
  },
  logoSlot: {
    height: HEADER_ROW_MIN_HEIGHT,
    justifyContent: "center",
    overflow: "visible",
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radii.logo,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  bookButton: {
    backgroundColor: colors.taupe,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radii.pill,
  },
  bookButtonPressed: {
    opacity: 0.9,
  },
  bookLabel: {
    fontFamily: fontFamilies.montserrat.regular,
    fontSize: typography.bookCta,
    color: colors.white,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    lineHeight: typography.body + space.xs,
  },
});
