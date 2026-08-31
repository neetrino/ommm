import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
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
import { TabBarIcon } from "./TabBarIcon";
import { useTabBarIndicator } from "./useTabBarIndicator";

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

  const activeIndex = Math.max(
    0,
    tabItems.findIndex((item) => isRouteActive(pathname, item.href as string)),
  );
  const activeKey = tabItems[activeIndex]?.key;
  const { barRef, indicatorX, indicatorY, setIconSlotRef, measureIconSlot } =
    useTabBarIndicator(activeKey);

  return (
    <View
      style={[styles.outer, { bottom, left, right }]}
      accessibilityRole="tablist"
    >
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
            <View ref={barRef} style={styles.barTrack} collapsable={false}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.indicator,
                  {
                    width: tabHighlightSize,
                    height: tabHighlightSize,
                    borderRadius: chipRadius,
                    transform: [
                      { translateX: indicatorX },
                      { translateY: indicatorY },
                    ],
                  },
                ]}
              />
              {tabItems.map((item, index) => {
                const active = index === activeIndex;
                const iconColor = active
                  ? colors.taupe
                  : colors.creamHighlight;
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
                        ref={(node) => {
                          setIconSlotRef(item.key, node);
                        }}
                        collapsable={false}
                        onLayout={() => {
                          measureIconSlot(item.key, active);
                        }}
                        style={[
                          styles.iconWrap,
                          {
                            width: tabHighlightSize,
                            height: tabHighlightSize,
                            borderRadius: chipRadius,
                          },
                        ]}
                      >
                        <TabBarIcon
                          iconName={item.iconName}
                          size={Math.round(item.iconSize * iconSizeScale)}
                          color={iconColor}
                          inactive={!active}
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
            </View>
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
    overflow: "hidden",
  },
  barTrack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: colors.creamHighlight,
    zIndex: 0,
  },
  tabPressable: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    backgroundColor: "transparent",
    zIndex: 1,
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
    backgroundColor: "transparent",
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
