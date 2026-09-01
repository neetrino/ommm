import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
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
import { fontFamilies } from "../../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../../theme/tokens";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type BookingsTabNavProps = {
  upcomingLabel: string;
  pastLabel: string;
  ariaLabel: string;
  activeTab: "upcoming" | "past";
  onTabChange: (tab: "upcoming" | "past") => void;
};

const PAST_TAB_ICON: IconName = "history";
const CURRENT_TAB_ICON: IconName = "calendar-clock";
const TAB_ICON_SIZE = 16;
const INDICATOR_DURATION_MS = 260;
const INDICATOR_EASING = Easing.bezier(0.4, 0, 0.2, 1);
const SHELL_PAD = 4;

export function BookingsTabNav({
  upcomingLabel,
  pastLabel,
  ariaLabel,
  activeTab,
  onTabChange,
}: BookingsTabNavProps) {
  const trackRef = useRef<RNView>(null);
  const tabRefs = useRef<Record<"past" | "upcoming", RNView | null>>({
    past: null,
    upcoming: null,
  });
  const tabLayouts = useRef<
    Partial<Record<"past" | "upcoming", { x: number; width: number }>>
  >({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const hasPlaced = useRef(false);

  const moveIndicator = useCallback(
    (tab: "past" | "upcoming", instant: boolean) => {
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
    (tab: "past" | "upcoming") => {
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
    measureTab("past");
    measureTab("upcoming");
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
        label={pastLabel}
        icon={PAST_TAB_ICON}
        selected={activeTab === "past"}
        onPress={() => onTabChange("past")}
        onSlotRef={(node) => {
          tabRefs.current.past = node;
        }}
        onSlotLayout={() => {
          measureTab("past");
        }}
      />
      <TabButton
        label={upcomingLabel}
        icon={CURRENT_TAB_ICON}
        selected={activeTab === "upcoming"}
        onPress={() => onTabChange("upcoming")}
        onSlotRef={(node) => {
          tabRefs.current.upcoming = node;
        }}
        onSlotLayout={() => {
          measureTab("upcoming");
        }}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  onSlotRef: (node: RNView | null) => void;
  onSlotLayout: () => void;
};

function TabButton({
  label,
  icon,
  selected,
  onPress,
  onSlotRef,
  onSlotLayout,
}: TabButtonProps) {
  const iconColor = selected ? colors.primaryGreen : colors.bodyMuted;
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
      <View style={styles.tabInner}>
        <MaterialCommunityIcons
          name={icon}
          size={TAB_ICON_SIZE}
          color={iconColor}
        />
        <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
          {label}
        </Text>
      </View>
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
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
