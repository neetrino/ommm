import { StyleSheet } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { scheduleColors } from "../../schedule/scheduleTokens";

export const paymentStatusFilterDropdownStyles = StyleSheet.create({
  wrap: {
    gap: space.xs,
  },
  fieldLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    letterSpacing: 0.2,
    color: colors.ink,
  },
  trigger: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: scheduleColors.filterBorder,
    backgroundColor: scheduleColors.filterBg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 8,
      opacity: 0.1,
      radius: 16,
      elevation: 2,
    }),
  },
  triggerOpen: {
    borderColor: "rgba(105, 95, 0, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  triggerPressed: {
    opacity: 0.92,
  },
  triggerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  triggerLabel: {
    flex: 1,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    letterSpacing: 0.28,
    color: scheduleColors.body,
  },
  multiDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toneDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
  toneDotLarge: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.scrimDark,
  },
  sheet: {
    zIndex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.md,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: scheduleColors.shellBorder,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: -8,
      opacity: 0.14,
      radius: 24,
      elevation: 10,
    }),
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: "rgba(151, 144, 124, 0.35)",
  },
  sheetTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle,
    color: scheduleColors.heading,
  },
  options: {
    gap: space.xs,
  },
  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(151, 144, 124, 0.22)",
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  optionActive: {
    borderColor: "rgba(105, 95, 0, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionLabel: {
    flex: 1,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 15,
    color: scheduleColors.body,
  },
  optionLabelActive: {
    fontFamily: fontFamilies.manrope.semiBold,
    color: scheduleColors.oliveActive,
  },
  applyButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: scheduleColors.olive,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 8,
      opacity: 0.16,
      radius: 14,
      elevation: 3,
    }),
  },
  applyButtonPressed: {
    opacity: 0.9,
  },
  applyLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: scheduleColors.canvasText,
  },
});
