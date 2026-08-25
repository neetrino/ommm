import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

export function BookingsTabNav({
  upcomingLabel,
  pastLabel,
  ariaLabel,
  activeTab,
  onTabChange,
}: BookingsTabNavProps) {
  return (
    <View
      style={styles.shell}
      accessibilityRole="tablist"
      accessibilityLabel={ariaLabel}
    >
      <TabButton
        label={pastLabel}
        icon={PAST_TAB_ICON}
        selected={activeTab === "past"}
        onPress={() => onTabChange("past")}
      />
      <TabButton
        label={upcomingLabel}
        icon={CURRENT_TAB_ICON}
        selected={activeTab === "upcoming"}
        onPress={() => onTabChange("upcoming")}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
};

function TabButton({ label, icon, selected, onPress }: TabButtonProps) {
  const iconColor = selected ? colors.primaryGreen : colors.bodyMuted;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        selected && styles.tabSelected,
        pressed && styles.tabPressed,
      ]}
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
    flexDirection: "row",
    alignSelf: "stretch",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite35,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  tabSelected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
