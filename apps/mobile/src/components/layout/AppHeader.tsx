import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "../../i18n/I18nProvider";
import { fontFamilies } from "../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../theme/tokens";
import {
  APP_HEADER_BOTTOM_PAD,
  APP_HEADER_ROW_MIN_HEIGHT,
  APP_HEADER_SPHERE_SIZE,
  APP_HEADER_TOP_PAD,
} from "./screenChromeLayout";
import { HeaderSpinningSphere } from "./HeaderSpinningSphere";

type AppHeaderProps = {
  onBookPress: () => void;
};

/**
 * Header chrome pinned to the top of the screen: one continuous cream layer
 * (blur fills the whole shell), sphere + Book CTA under the status bar.
 */
export function AppHeader({ onBookPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const tHome = useTranslations("home");
  const tMarketing = useTranslations("marketingUi");

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top + APP_HEADER_TOP_PAD,
          paddingBottom: APP_HEADER_BOTTOM_PAD,
          paddingLeft: insets.left + space.screenHorizontal,
          paddingRight: insets.right + space.screenHorizontal,
        },
      ]}
    >
      <BlurView
        intensity={40}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.row, { minHeight: APP_HEADER_ROW_MIN_HEIGHT }]}>
        <HeaderSpinningSphere size={APP_HEADER_SPHERE_SIZE} />
        <Pressable
          onPress={onBookPress}
          style={({ pressed }) => [
            styles.bookButton,
            pressed && styles.bookButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={tHome("bookNow")}
        >
          <Text style={styles.bookLabel}>
            {tMarketing("bookAClass").toUpperCase()}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookButton: {
    backgroundColor: colors.taupe,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radii.pill,
    alignSelf: "center",
  },
  bookButtonPressed: {
    opacity: 0.9,
  },
  bookLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bookCta,
    color: colors.white,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    lineHeight: typography.body + space.xs,
  },
});
