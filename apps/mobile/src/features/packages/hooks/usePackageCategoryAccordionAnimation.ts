import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
} from "react-native";
import { PACKAGES_PAGE_MOBILE } from "../../../lib/packages/packagesPageTokens";

const ACCORDION_EASING = Easing.bezier(0.4, 0, 0.2, 1);

/** Mirrors web mobile accordion motion (`450ms`, `cubic-bezier(0.4, 0, 0.2, 1)`). */
export function usePackageCategoryAccordionAnimation(isExpanded: boolean) {
  const progress = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isExpanded ? 1 : 0,
      duration: PACKAGES_PAGE_MOBILE.transitionDurationMs,
      easing: ACCORDION_EASING,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, progress]);

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredHeight = Math.ceil(event.nativeEvent.layout.height);
    setContentHeight((current) =>
      measuredHeight > 0 && current !== measuredHeight ? measuredHeight : current,
    );
  }, []);

  return useMemo(() => {
    const animatedContentHeight = Animated.multiply(progress, contentHeight);
    const animatedContentOpacity = progress.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 0, 1],
    });
    const animatedContentPaddingTop = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, PACKAGES_PAGE_MOBILE.tierCardGapPx],
    });
    const animatedDetailsHeight = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [PACKAGES_PAGE_MOBILE.collapsedDetailsSizePx + 4, 0],
    });
    const animatedDetailsOpacity = progress.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [1, 0, 0],
    });
    const animatedDetailsMarginTop = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -12],
    });
    const animatedFabRotation = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["90deg", "-90deg"],
    });
    const animatedPaddingVertical = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [18, PACKAGES_PAGE_MOBILE.expandedPanelPaddingPx],
    });
    const animatedPaddingRight = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [16, PACKAGES_PAGE_MOBILE.expandedPanelPaddingPx],
    });
    const animatedPaddingLeft = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [20, PACKAGES_PAGE_MOBILE.expandedPanelPaddingPx],
    });

    return {
      animatedContentHeight,
      animatedContentOpacity,
      animatedContentPaddingTop,
      animatedDetailsHeight,
      animatedDetailsOpacity,
      animatedDetailsMarginTop,
      animatedFabRotation,
      animatedPaddingVertical,
      animatedPaddingRight,
      animatedPaddingLeft,
      onContentLayout,
    };
  }, [contentHeight, progress]);
}
