import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { TabIconName } from "../../../navigation/roleTabs";
import {
  TabBarClassesIcon,
  TabBarHomeIcon,
  TabBarPlansIcon,
  TabBarProfileIcon,
  TabBarScheduleIcon,
} from "./tabBarIcons";

type TabBarIconProps = {
  iconName: TabIconName;
  size: number;
  color: string;
  /** Dim inactive glyphs on the dark bar. */
  inactive?: boolean;
};

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Intrinsic Figma aspect ratios — fitted into a square `size` box. */
const FIGMA_ASPECT: Partial<
  Record<TabIconName, { width: number; height: number }>
> = {
  home: { width: 16, height: 18 },
  "view-dashboard": { width: 21, height: 21 },
  "clipboard-check-outline": { width: 21, height: 21 },
  "calendar-month": { width: 24, height: 24 },
  tag: { width: 22, height: 22 },
  "layers-outline": { width: 22, height: 22 },
  meditation: { width: 28, height: 23 },
  "account-circle-outline": { width: 28, height: 23 },
};

function fitSize(
  aspect: { width: number; height: number },
  box: number,
): { width: number; height: number } {
  const ratio = Math.min(box / aspect.width, box / aspect.height);
  return {
    width: Math.round(aspect.width * ratio),
    height: Math.round(aspect.height * ratio),
  };
}

/**
 * Figma tab glyphs for the classic floating bar; MCI for role-specific extras.
 */
export function TabBarIcon({
  iconName,
  size,
  color,
  inactive = false,
}: TabBarIconProps) {
  const aspect = FIGMA_ASPECT[iconName];
  const fitted = aspect ? fitSize(aspect, size) : null;

  let glyph: ReactNode = null;

  if (iconName === "home" && fitted) {
    glyph = (
      <TabBarHomeIcon
        width={fitted.width}
        height={fitted.height}
        color={color}
      />
    );
  } else if (
    (iconName === "view-dashboard" || iconName === "clipboard-check-outline") &&
    fitted
  ) {
    glyph = (
      <TabBarClassesIcon
        width={fitted.width}
        height={fitted.height}
        color={color}
      />
    );
  } else if (iconName === "calendar-month" && fitted) {
    glyph = (
      <TabBarScheduleIcon
        width={fitted.width}
        height={fitted.height}
        color={color}
      />
    );
  } else if ((iconName === "tag" || iconName === "layers-outline") && fitted) {
    glyph = (
      <TabBarPlansIcon
        width={fitted.width}
        height={fitted.height}
        color={color}
      />
    );
  } else if (
    (iconName === "meditation" || iconName === "account-circle-outline") &&
    fitted
  ) {
    glyph = (
      <TabBarProfileIcon
        width={fitted.width}
        height={fitted.height}
        color={color}
      />
    );
  } else {
    glyph = (
      <MaterialCommunityIcons
        name={iconName as MaterialIconName}
        size={size}
        color={color}
      />
    );
  }

  return (
    <View
      style={[
        styles.slot,
        { width: size, height: size },
        inactive && styles.inactive,
      ]}
    >
      {glyph}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: "center",
    justifyContent: "center",
  },
  inactive: {
    opacity: 0.85,
  },
});
