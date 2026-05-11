import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useSegments, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, gradients, layout, radii, shadows, space } from "../../../theme/tokens";

type TabKey = "home" | "classes" | "schedule" | "plans" | "profile";

/** MaterialCommunityIcons glyph name — kept narrow to the tabs we actually render. */
type TabIconName =
  | "home"
  | "view-dashboard"
  | "calendar-month"
  | "tag"
  | "meditation";

type TabItem = {
  key: TabKey;
  label: string;
  href: Href;
  iconName: TabIconName;
  iconSize: number;
};

const TAB_ITEMS: TabItem[] = [
  { key: "home", label: "Home", href: "/home", iconName: "home", iconSize: 22 },
  { key: "classes", label: "Classes", href: "/classes", iconName: "view-dashboard", iconSize: 22 },
  { key: "schedule", label: "Schedule", href: "/schedule", iconName: "calendar-month", iconSize: 24 },
  { key: "plans", label: "Plans", href: "/plans", iconName: "tag", iconSize: 22 },
  { key: "profile", label: "Profile", href: "/profile", iconName: "meditation", iconSize: 26 },
];

const TAB_ICON_INACTIVE_OPACITY = 0.85;

function isTabActive(segments: string[], item: TabItem): boolean {
  return segments.includes(item.key);
}

export function FloatingTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { isSignedIn } = useSession();

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
          const iconColor = active ? colors.taupe : colors.creamHighlight;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                if (item.key === "profile" && !isSignedIn) {
                  router.push("/home");
                  return;
                }
                router.push(item.href);
              }}
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
                <View style={!active && styles.iconInactive}>
                  <MaterialCommunityIcons
                    name={item.iconName}
                    size={item.iconSize}
                    color={iconColor}
                  />
                </View>
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

/** Active chip diameter; column width is kept smaller so 5 tabs stay packed and the chip can overhang. */
const TAB_HIGHLIGHT_SIZE = 72;
const TAB_HIGHLIGHT_RADIUS = TAB_HIGHLIGHT_SIZE / 2;
const TAB_INNER = 66;
const FLOATING_TAB_BAR_HEIGHT = 82;
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
  iconInactive: {
    opacity: TAB_ICON_INACTIVE_OPACITY,
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
