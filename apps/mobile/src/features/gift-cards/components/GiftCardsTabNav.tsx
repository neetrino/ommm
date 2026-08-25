import { Pressable, StyleSheet, Text, View } from "react-native";
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

export function GiftCardsTabNav({
  myLabel,
  shopLabel,
  ariaLabel,
  activeTab,
  onTabChange,
}: GiftCardsTabNavProps) {
  return (
    <View
      style={styles.shell}
      accessibilityRole="tablist"
      accessibilityLabel={ariaLabel}
    >
      <TabButton
        label={myLabel}
        selected={activeTab === "my"}
        onPress={() => onTabChange("my")}
      />
      <TabButton
        label={shopLabel}
        selected={activeTab === "shop"}
        onPress={() => onTabChange("shop")}
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
