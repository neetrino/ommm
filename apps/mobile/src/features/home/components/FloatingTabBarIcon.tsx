import { Image, type ImageSource } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors } from "../../../theme/tokens";

const TAB_ICON_ACTIVE_OPACITY = 1;
const TAB_ICON_INACTIVE_OPACITY = 0.48;
const TAB_ICON_TRANSITION_MS = 200;
/** Icons are exported for the dark bar (light glyphs); on cream active chip use taupe like the label. */
const TAB_ICON_ACTIVE_TINT = colors.taupe;

type FloatingTabBarIconProps = {
  active: boolean;
  /** Shown when the tab is active (and when no `inactiveSource` is set, dimmed for inactive). */
  sourceActive: ImageSource;
  /** Optional asset for the inactive state; enables a crossfade instead of opacity dimming. */
  sourceInactive?: ImageSource;
  size: { width: number; height: number };
};

/**
 * Tab icon with animated active/inactive presentation.
 * Uses a crossfade when `sourceInactive` is set; otherwise animates opacity on `sourceActive`.
 */
export function FloatingTabBarIcon({
  active,
  sourceActive,
  sourceInactive,
  size,
}: FloatingTabBarIconProps) {
  const singleOpacity = useRef(
    new Animated.Value(active ? TAB_ICON_ACTIVE_OPACITY : TAB_ICON_INACTIVE_OPACITY),
  ).current;

  const pairActiveOpacity = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pairInactiveOpacity = useRef(new Animated.Value(active ? 0 : 1)).current;

  useEffect(() => {
    if (sourceInactive) {
      Animated.parallel([
        Animated.timing(pairActiveOpacity, {
          toValue: active ? 1 : 0,
          duration: TAB_ICON_TRANSITION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(pairInactiveOpacity, {
          toValue: active ? 0 : 1,
          duration: TAB_ICON_TRANSITION_MS,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.timing(singleOpacity, {
      toValue: active ? TAB_ICON_ACTIVE_OPACITY : TAB_ICON_INACTIVE_OPACITY,
      duration: TAB_ICON_TRANSITION_MS,
      useNativeDriver: true,
    }).start();
  }, [
    active,
    sourceInactive,
    singleOpacity,
    pairActiveOpacity,
    pairInactiveOpacity,
  ]);

  if (sourceInactive) {
    return (
      <View style={[styles.iconStack, size]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: pairInactiveOpacity }]}
          pointerEvents="none"
        >
          <Image
            source={sourceInactive}
            style={size}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: pairActiveOpacity }]}
          pointerEvents="none"
        >
          <Image
            source={sourceActive}
            style={size}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>
    );
  }

  const iconStyle = [
    size,
    // Single-asset tabs: light glyph on dark bar → taupe on cream active chip (pair assets keep designer colors).
    active ? { tintColor: TAB_ICON_ACTIVE_TINT } : undefined,
  ];

  return (
    <Animated.View style={{ opacity: singleOpacity }}>
      <Image
        source={sourceActive}
        style={iconStyle}
        contentFit="contain"
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconStack: {
    position: "relative",
  },
});
