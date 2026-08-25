import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing } from "react-native";

const BACKDROP_FADE_IN_MS = 280;
const BACKDROP_FADE_OUT_MS = 200;
const SHEET_SLIDE_IN_MS = 420;
const SHEET_SLIDE_OUT_MS = 300;
const SHEET_ENTER_OFFSET_PX = Math.round(Dimensions.get("window").height * 0.55);

type UsePackageSubscribeSheetMotionParams = {
  visible: boolean;
};

/**
 * Backdrop fades in place; sheet slides up independently
 * (avoids Modal `animationType="slide"` moving the scrim with the panel).
 */
export function usePackageSubscribeSheetMotion({
  visible,
}: UsePackageSubscribeSheetMotionParams): {
  rendered: boolean;
  backdropOpacity: Animated.Value;
  sheetTranslateY: Animated.Value;
} {
  const [rendered, setRendered] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(visible ? 0 : SHEET_ENTER_OFFSET_PX),
  ).current;
  const visibleRef = useRef(visible);

  useEffect(() => {
    visibleRef.current = visible;

    if (visible) {
      setRendered(true);
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(SHEET_ENTER_OFFSET_PX);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: BACKDROP_FADE_IN_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: SHEET_SLIDE_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: BACKDROP_FADE_OUT_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_ENTER_OFFSET_PX,
        duration: SHEET_SLIDE_OUT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !visibleRef.current) {
        setRendered(false);
      }
    });
  }, [backdropOpacity, sheetTranslateY, visible]);

  return {
    rendered,
    backdropOpacity,
    sheetTranslateY,
  };
}
