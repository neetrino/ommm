import { Image, type ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useSegments, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { figmaRemoteAssets } from "../../../assets/figmaRemoteAssets";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, gradients, layout, radii, shadows, space } from "../../../theme/tokens";

type TabKey = "home" | "classes" | "schedule" | "plans" | "profile";

type TabItem = {
  key: TabKey;
  label: string;
  href: Href;
  iconSource: ImageSource;
  iconSize: { width: number; height: number };
};

const TAB_ITEMS: TabItem[] = [
  {
    key: "home",
    label: "Home",
    href: "/",
    iconSource: figmaRemoteAssets.tabHome,
    iconSize: { width: 16, height: 18 },
  },
  {
    key: "classes",
    label: "Classes",
    href: "/classes",
    iconSource: figmaRemoteAssets.tabClasses,
    iconSize: { width: 21, height: 21 },
  },
  {
    key: "schedule",
    label: "Schedule",
    href: "/schedule",
    iconSource: figmaRemoteAssets.tabSchedule,
    iconSize: { width: 24, height: 24 },
  },
  {
    key: "plans",
    label: "Plans",
    href: "/plans",
    iconSource: figmaRemoteAssets.tabPlans,
    iconSize: { width: 22, height: 22 },
  },
  {
    key: "profile",
    label: "Profile",
    href: "/profile",
    iconSource: figmaRemoteAssets.tabProfile,
    iconSize: { width: 28, height: 23 },
  },
];

function isTabActive(segments: string[], item: TabItem): boolean {
  if (item.key === "home") {
    return !segments.some((s) =>
      ["classes", "schedule", "plans", "profile"].includes(s),
    );
  }
  return segments.includes(item.key);
}

export function FloatingTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  const bottom = Math.max(insets.bottom, space.sm) + space.xs;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outer, { bottom }]}
      accessibilityRole="tablist"
    >
      <LinearGradient
        colors={[...gradients.navBar.colors]}
        start={gradients.navBar.start}
        end={gradients.navBar.end}
        style={[styles.bar, shadows.tabBar]}
      >
        {TAB_ITEMS.map((item) => {
          const active = isTabActive(segments, item);
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [
                styles.tabPressable,
                pressed && styles.tabPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
            >
              <View
                style={[
                  styles.tabHighlight,
                  active && styles.tabHighlightActive,
                ]}
              >
                <Image
                  source={item.iconSource}
                  style={item.iconSize}
                  contentFit="contain"
                  accessibilityIgnoresInvertColors
                />
                <Text
                  style={[styles.tabLabel, active ? styles.tabLabelActive : undefined]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

/** Tab column width matches highlight so the chip scales evenly on both axes. */
const TAB_HIGHLIGHT_SIZE = 66;
const TAB_HIGHLIGHT_RADIUS = TAB_HIGHLIGHT_SIZE / 2;
const TAB_INNER = TAB_HIGHLIGHT_SIZE;
const FLOATING_TAB_BAR_HEIGHT = 76;
const TAB_BAR_HORIZONTAL_INSET = space.sm;

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: TAB_BAR_HORIZONTAL_INSET,
    right: TAB_BAR_HORIZONTAL_INSET,
    alignItems: "center",
    zIndex: 30,
    maxWidth: layout.designWidth,
    alignSelf: "center",
  },
  bar: {
    width: "100%",
    height: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg - 1,
  },
  tabPressable: {
    width: TAB_INNER,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  tabHighlight: {
    width: TAB_HIGHLIGHT_SIZE,
    height: TAB_HIGHLIGHT_SIZE,
    borderRadius: TAB_HIGHLIGHT_RADIUS,
    alignSelf: "center",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  tabHighlightActive: {
    backgroundColor: colors.creamHighlight,
  },
  tabPressed: {
    opacity: 0.92,
  },
  tabLabel: {
    fontFamily: fontFamilies.montserrat.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.creamHighlight,
  },
  tabLabelActive: {
    fontFamily: fontFamilies.montserrat.bold,
    lineHeight: 24,
    color: colors.taupe,
  },
});
