import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontFamilies } from "../../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../../theme/tokens";

type BookingsTabNavProps = {
  upcomingLabel: string;
  pastLabel: string;
  ariaLabel: string;
  activeTab: "upcoming" | "past";
  onTabChange: (tab: "upcoming" | "past") => void;
};

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
        selected={activeTab === "past"}
        onPress={() => onTabChange("past")}
      />
      <TabButton
        label={upcomingLabel}
        selected={activeTab === "upcoming"}
        onPress={() => onTabChange("upcoming")}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function TabButton({ label, selected, onPress }: TabButtonProps) {
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
      <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
        {label}
      </Text>
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
