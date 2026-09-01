import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type View as RNView,
} from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import type { GiftCardsTab } from "../hooks/useMemberGiftCardsScreenState";

type GiftCardsTabNavProps = {
  myLabel: string;
  shopLabel: string;
  ariaLabel: string;
  activeTab: GiftCardsTab;
  onTabChange: (tab: GiftCardsTab) => void;
};

const INDICATOR_DURATION_MS = 260;
const INDICATOR_EASING = Easing.bezier(0.4, 0, 0.2, 1);
const SHELL_PAD = 4;

export function GiftCardsTabNav({
  myLabel,
  shopLabel,
  ariaLabel,
  activeTab,
  onTabChange,
}: GiftCardsTabNavProps) {
  const trackRef = useRef<RNView>(null);
  const tabRefs = useRef<Record<GiftCardsTab, RNView | null>>({
    my: null,
    shop: null,
  });
  const tabLayouts = useRef<
    Partial<Record<GiftCardsTab, { x: number; width: number }>>
  >({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const hasPlaced = useRef(false);

  const moveIndicator = useCallback(
    (tab: GiftCardsTab, instant: boolean) => {
      const layout = tabLayouts.current[tab];
      if (!layout) {
        return;
      }
      if (instant || !hasPlaced.current) {
        indicatorX.setValue(layout.x);
        indicatorWidth.setValue(layout.width);
        hasPlaced.current = true;
        return;
      }
      Animated.parallel([
        Animated.timing(indicatorX, {
          toValue: layout.x,
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorWidth, {
          toValue: layout.width,
          duration: INDICATOR_DURATION_MS,
          easing: INDICATOR_EASING,
          useNativeDriver: false,
        }),
      ]).start();
    },
    [indicatorX, indicatorWidth],
  );

  const measureTab = useCallback(
    (tab: GiftCardsTab) => {
      const node = tabRefs.current[tab];
      const track = trackRef.current;
      if (!node || !track) {
        return;
      }
      node.measureLayout(
        track,
        (x, _y, width) => {
          tabLayouts.current[tab] = { x, width };
          if (tab === activeTab) {
            moveIndicator(tab, !hasPlaced.current);
          }
        },
        () => {
          // Next layout pass retries.
        },
      );
    },
    [activeTab, moveIndicator],
  );

  useEffect(() => {
    moveIndicator(activeTab, false);
  }, [activeTab, moveIndicator]);

  const onTrackLayout = (_event: LayoutChangeEvent) => {
    measureTab("my");
    measureTab("shop");
  };

  return (
    <View
      ref={trackRef}
      collapsable={false}
      onLayout={onTrackLayout}
      style={styles.shell}
      accessibilityRole="tablist"
      accessibilityLabel={ariaLabel}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            left: indicatorX,
            width: indicatorWidth,
          },
        ]}
      />
      <TabButton
        label={myLabel}
        selected={activeTab === "my"}
        onPress={() => onTabChange("my")}
        onSlotRef={(node) => {
          tabRefs.current.my = node;
        }}
        onSlotLayout={() => {
          measureTab("my");
        }}
      />
      <TabButton
        label={shopLabel}
        selected={activeTab === "shop"}
        onPress={() => onTabChange("shop")}
        onSlotRef={(node) => {
          tabRefs.current.shop = node;
        }}
        onSlotLayout={() => {
          measureTab("shop");
        }}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  onSlotRef: (node: RNView | null) => void;
  onSlotLayout: () => void;
};

function TabButton({
  label,
  selected,
  onPress,
  onSlotRef,
  onSlotLayout,
}: TabButtonProps) {
  return (
    <Pressable
      ref={onSlotRef}
      collapsable={false}
      onLayout={onSlotLayout}
      onPress={onPress}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    flexDirection: "row",
    alignSelf: "stretch",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite35,
    padding: SHELL_PAD,
    gap: 4,
  },
  indicator: {
    position: "absolute",
    top: SHELL_PAD,
    bottom: SHELL_PAD,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  tabPressed: {
    opacity: 0.92,
  },
  tabLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.bodyMuted,
  },
  tabLabelSelected: {
    color: colors.primaryGreen,
  },
});
