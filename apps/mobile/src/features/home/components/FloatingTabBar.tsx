import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import {
  type RoleTabItem,
  tabItemsForRole,
} from "../../../navigation/roleTabs";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, gradients, layout, radii, shadows, space } from "../../../theme/tokens";

const TAB_ICON_INACTIVE_OPACITY = 0.85;

function isRouteActive(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }
  const prefix = href.endsWith("/") ? href : `${href}/`;
  return pathname.startsWith(prefix);
}

export function FloatingTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useSession();
  const tabItems: RoleTabItem[] = tabItemsForRole(role);

  const bottom = Math.max(insets.bottom, space.sm) + space.xs;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outer, { bottom }]}
      accessibilityRole="tablist"
    >
      <LinearGradient
        colors={gradients.navBar.colors}
        start={gradients.navBar.start}
        end={gradients.navBar.end}
        style={[styles.bar, shadows.tabBar]}
      >
        {tabItems.map((item) => {
          const active = isRouteActive(pathname, item.href as string);
          const iconColor = active ? colors.taupe : colors.creamHighlight;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
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
                  numberOfLines={2}
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

/** Active chip diameter; column width is kept smaller so tabs stay packed and the chip can overhang. */
const TAB_HIGHLIGHT_SIZE = 68;
const TAB_HIGHLIGHT_RADIUS = TAB_HIGHLIGHT_SIZE / 2;
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
    paddingHorizontal: space.sm,
  },
  tabPressable: {
    flex: 1,
    minWidth: 52,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  tabHighlight: {
    width: "100%",
    minHeight: TAB_HIGHLIGHT_SIZE,
    borderRadius: TAB_HIGHLIGHT_RADIUS,
    alignSelf: "center",
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 2,
  },
  tabHighlightActive: {
    backgroundColor: colors.creamHighlight,
    width: TAB_HIGHLIGHT_SIZE,
    height: TAB_HIGHLIGHT_SIZE,
    minHeight: TAB_HIGHLIGHT_SIZE,
  },
  iconInactive: {
    opacity: TAB_ICON_INACTIVE_OPACITY,
  },
  tabPressed: {
    opacity: 0.92,
  },
  tabLabel: {
    fontFamily: fontFamilies.montserrat.regular,
    fontSize: 10,
    lineHeight: 12,
    color: colors.creamHighlight,
    textAlign: "center",
  },
  tabLabelActive: {
    fontFamily: fontFamilies.montserrat.bold,
    lineHeight: 12,
    color: colors.taupe,
  },
});
