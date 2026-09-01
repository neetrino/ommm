import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const CHEVRON_ROTATE_MS = 280;
const CHEVRON_EASING = Easing.bezier(0.32, 0.72, 0, 1);

type AnimatedFilterChevronProps = {
  open: boolean;
  color: string;
  size?: number;
};

/** Chevron that rotates smoothly between closed (down) and open (up). */
export function AnimatedFilterChevron({
  open,
  color,
  size = 20,
}: AnimatedFilterChevronProps) {
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: CHEVRON_ROTATE_MS,
      easing: CHEVRON_EASING,
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <MaterialCommunityIcons
        name="chevron-down"
        size={size}
        color={color}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Animated.View>
  );
}
