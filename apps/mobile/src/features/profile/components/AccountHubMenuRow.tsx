import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { accountHubLayout } from "../accountHubLayout";
import { colors } from "../../../theme/tokens";

const CHEVRON_SIZE = 18;
const ICON_COLOR = colors.taupe;

type AccountHubMenuRowProps = {
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
  showIcon?: boolean;
  isLast?: boolean;
};

export function AccountHubMenuRow({
  label,
  icon,
  onPress,
  danger = false,
  showChevron = true,
  showIcon = true,
  isLast = false,
}: AccountHubMenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        accountHubLayout.menuRow,
        danger ? accountHubLayout.menuRowDanger : null,
        isLast ? accountHubLayout.menuRowLast : null,
        pressed ? accountHubLayout.menuRowPressed : null,
      ]}
      accessibilityRole="button"
    >
      <View style={accountHubLayout.iconWrap}>
        {showIcon ? (
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={danger ? colors.danger : ICON_COLOR}
          />
        ) : null}
      </View>
      <Text style={[accountHubLayout.label, danger && accountHubLayout.labelDanger]}>
        {label}
      </Text>
      {showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={CHEVRON_SIZE}
          color={danger ? colors.danger : ICON_COLOR}
        />
      ) : null}
    </Pressable>
  );
}
