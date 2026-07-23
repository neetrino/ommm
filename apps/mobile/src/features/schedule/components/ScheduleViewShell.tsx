import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewProps } from "react-native";
import {
  SCHEDULE_PAGE_MOBILE,
  SCHEDULE_SHELL_GRADIENT,
} from "../../../lib/schedule/schedulePageTokens";
import { platformShadow } from "../../../theme/platformShadow";
import { scheduleColors } from "../scheduleTokens";

type ScheduleViewShellProps = ViewProps & {
  children: React.ReactNode;
};

export function ScheduleViewShell({ children, style, ...rest }: ScheduleViewShellProps) {
  return (
    <View style={[styles.outer, style]} {...rest}>
      <LinearGradient
        colors={[...SCHEDULE_SHELL_GRADIENT.colors]}
        locations={[...SCHEDULE_SHELL_GRADIENT.locations]}
        start={SCHEDULE_SHELL_GRADIENT.start}
        end={SCHEDULE_SHELL_GRADIENT.end}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    minWidth: 0,
    borderRadius: SCHEDULE_PAGE_MOBILE.shellRadiusPx,
    borderWidth: 1,
    borderColor: scheduleColors.shellBorder,
    overflow: "hidden",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 24,
      opacity: 0.28,
      radius: 48,
      elevation: 4,
    }),
  },
  inner: {
    gap: SCHEDULE_PAGE_MOBILE.shellGapPx,
    paddingHorizontal: SCHEDULE_PAGE_MOBILE.shellPaddingPx,
    paddingVertical: SCHEDULE_PAGE_MOBILE.shellPaddingPx,
  },
});
