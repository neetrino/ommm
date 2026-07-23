import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import {
  accountHubChevronColor,
  accountHubDangerChevronColor,
  accountHubDangerTextColor,
  accountHubIconColor,
  accountHubLayout,
} from "../accountHubLayout";

const CHEVRON_SIZE = 16;
const ICON_SIZE = 20;

type AccountHubMenuRowProps = {
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
  showIcon?: boolean;
  showTopBorder?: boolean;
};

export function AccountHubMenuRow({
  label,
  icon,
  onPress,
  danger = false,
  showChevron = true,
  showIcon = true,
  showTopBorder = false,
}: AccountHubMenuRowProps) {
  const iconColor = danger ? accountHubDangerTextColor : accountHubIconColor;
  const chevronColor = danger ? accountHubDangerChevronColor : accountHubChevronColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        accountHubLayout.menuRow,
        showTopBorder ? accountHubLayout.menuRowBorderTop : null,
        danger ? accountHubLayout.menuRowDanger : null,
        pressed
          ? danger
            ? accountHubLayout.menuRowDangerPressed
            : accountHubLayout.menuRowPressed
          : null,
      ]}
      accessibilityRole="button"
    >
      <View style={accountHubLayout.iconWrap}>
        {showIcon ? (
          <MaterialCommunityIcons name={icon} size={ICON_SIZE} color={iconColor} />
        ) : null}
      </View>
      <Text style={[accountHubLayout.label, danger && accountHubLayout.labelDanger]}>
        {label}
      </Text>
      {showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={CHEVRON_SIZE}
          color={chevronColor}
        />
      ) : null}
    </Pressable>
  );
}
