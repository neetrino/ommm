import { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, Easing } from "react-native";

const SHEET_ENTER_MS = 320;
const SHEET_EXIT_MS = 300;
const SHEET_ENTER_EASING = Easing.bezier(0.32, 0.72, 0, 1);
const SHEET_EXIT_EASING = Easing.bezier(0.4, 0, 0.2, 1);
/** Travel far enough that the sheet fully leaves the viewport. */
const SHEET_SLIDE_DISTANCE = Math.round(Dimensions.get("window").height);

type UseBottomSheetSlideMotionResult = {
  backdropOpacity: Animated.Value;
  sheetTranslateY: Animated.AnimatedInterpolation<number>;
  animateClose: (onFinished: () => void) => void;
};

/**
 * Bottom-sheet motion: slides up on open, slides down on close; backdrop fades with it.
 */
export function useBottomSheetSlideMotion(
  presented: boolean,
): UseBottomSheetSlideMotionResult {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetProgress = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  useEffect(() => {
    if (!presented) {
      return;
    }
    closingRef.current = false;
    backdropOpacity.setValue(0);
    sheetProgress.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: SHEET_ENTER_MS,
        easing: SHEET_ENTER_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(sheetProgress, {
        toValue: 1,
        duration: SHEET_ENTER_MS,
        easing: SHEET_ENTER_EASING,
        useNativeDriver: true,
      }),
    ]).start();
  }, [presented, backdropOpacity, sheetProgress]);

  const animateClose = useCallback(
    (onFinished: () => void) => {
      if (closingRef.current) {
        return;
      }
      closingRef.current = true;
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: SHEET_EXIT_MS,
          easing: SHEET_EXIT_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(sheetProgress, {
          toValue: 0,
          duration: SHEET_EXIT_MS,
          easing: SHEET_EXIT_EASING,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        closingRef.current = false;
        if (finished) {
          onFinished();
        }
      });
    },
    [backdropOpacity, sheetProgress],
  );

  const sheetTranslateY = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_SLIDE_DISTANCE, 0],
  });

  return {
    backdropOpacity,
    sheetTranslateY,
    animateClose,
  };
}
