import { StyleSheet } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { scheduleColors } from "../scheduleTokens";

export const scheduleFilterFieldStyles = StyleSheet.create({
  trigger: {
    width: "100%",
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: scheduleColors.filterBorder,
    backgroundColor: scheduleColors.filterBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 8,
      opacity: 0.1,
      radius: 16,
      elevation: 2,
    }),
  },
  triggerPressed: {
    opacity: 0.92,
  },
  label: {
    flex: 1,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    letterSpacing: 0.28,
    color: scheduleColors.body,
  },
  backdropRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    zIndex: 1,
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  optionsScroll: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionFirst: {
    paddingTop: 18,
  },
  optionActive: {
    backgroundColor: "rgba(151, 144, 124, 0.12)",
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
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(151, 144, 124, 0.28)",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  applyButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
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
