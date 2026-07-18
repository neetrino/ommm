import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../auth/SessionProvider";
import {
  type TranslatedRoleTabItem,
  useRoleTabs,
} from "../../../navigation/useRoleTabs";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, gradients, shadows, space } from "../../../theme/tokens";
import { FLOATING_TAB_BAR_OUTER_BOTTOM_EXTRA } from "../../../components/layout/screenChromeLayout";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";

const TAB_ICON_INACTIVE_OPACITY = 0.85;
const TAB_BAR_HORIZONTAL_INSET = space.sm;
const TAB_LABEL_MIN_FONT_SCALE = 0.62;
const TAB_BAR_MAX_WIDTH_PORTRAIT = 390;

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
  const { width: windowWidth } = useWindowDimensions();
  const { role } = useSession();
  const tabItems: TranslatedRoleTabItem[] = useRoleTabs(role);
  const { tabBarHeight, tabHighlightSize, compact, isLandscape } =
    useScreenChromeInsets({
      tabBar: false,
    });

  const bottom =
    Math.max(insets.bottom, space.sm) + FLOATING_TAB_BAR_OUTER_BOTTOM_EXTRA;
  /** Half of bar height = true capsule ends (more reliable than 9999 on iOS). */
  const barRadius = tabBarHeight / 2;
  const chipRadius = tabHighlightSize / 2;
  const iconSizeScale = compact ? 0.8 : 1;
  const sidePad = isLandscape ? space.md : TAB_BAR_HORIZONTAL_INSET;
  const left = insets.left + sidePad;
  const right = insets.right + sidePad;
  const availableWidth = Math.max(0, windowWidth - left - right);
  const maxBarWidth = isLandscape
    ? availableWidth
    : Math.min(TAB_BAR_MAX_WIDTH_PORTRAIT, availableWidth);

  return (
    <View
      style={[styles.outer, { bottom, left, right }]}
      accessibilityRole="tablist"
    >
      {/* Shadow outside clip — iOS clips shadow if overflow:hidden is on the same node.
          Same borderRadius on the shadow shell so web box-shadow is a capsule, not a rect. */}
      <View
        style={[
          styles.shadowShell,
          shadows.tabBar,
          { maxWidth: maxBarWidth, borderRadius: barRadius },
        ]}
      >
        <View
          style={[
            styles.clipShell,
            {
              borderRadius: barRadius,
              backgroundColor: gradients.navBar.colors[1],
            },
          ]}
        >
          <LinearGradient
            colors={gradients.navBar.colors}
            start={gradients.navBar.start}
            end={gradients.navBar.end}
            style={[
              styles.bar,
              {
                height: tabBarHeight,
                borderRadius: barRadius,
                paddingHorizontal: compact ? space.xs : space.sm,
              },
            ]}
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
                      styles.tabInner,
                      compact ? styles.tabInnerCompact : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          width: tabHighlightSize,
                          height: tabHighlightSize,
                          borderRadius: chipRadius,
                        },
                        active && styles.iconWrapActive,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.iconName}
                        size={Math.round(item.iconSize * iconSizeScale)}
                        color={iconColor}
                        style={!active ? styles.iconInactive : undefined}
                      />
                    </View>
                    <Text
                      style={[
                        styles.tabLabel,
                        compact ? styles.tabLabelCompact : null,
                        active ? styles.tabLabelActive : null,
                      ]}
                      numberOfLines={compact ? 1 : 2}
                      adjustsFontSizeToFit
                      minimumFontScale={TAB_LABEL_MIN_FONT_SCALE}
                      ellipsizeMode="clip"
                    >
                      {item.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    alignItems: "center",
    zIndex: 30,
    pointerEvents: "box-none",
  },
  shadowShell: {
    width: "100%",
    backgroundColor: "transparent",
  },
  clipShell: {
    width: "100%",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  tabPressable: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    backgroundColor: "transparent",
  },
  tabInner: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabInnerCompact: {
    gap: 1,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconWrapActive: {
    backgroundColor: colors.creamHighlight,
  },
  iconInactive: {
    opacity: TAB_ICON_INACTIVE_OPACITY,
  },
  tabPressed: {
    opacity: 0.92,
  },
  tabLabel: {
    width: "100%",
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 10,
    lineHeight: 12,
    color: colors.creamHighlight,
    textAlign: "center",
  },
  tabLabelCompact: {
    fontSize: 9,
    lineHeight: 11,
  },
  tabLabelActive: {
    fontFamily: fontFamilies.manrope.semiBold,
    color: colors.creamHighlight,
  },
});
