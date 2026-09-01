import { StyleSheet, type ViewStyle } from "react-native";
import { SCHEDULE_PAGE_MOBILE } from "../../lib/schedule/schedulePageTokens";
import { fontFamilies } from "../../theme/fontFamilies";
import { platformShadow } from "../../theme/platformShadow";
import { colors, space, typography } from "../../theme/tokens";
import { scheduleColors } from "../schedule/scheduleTokens";

/** Web: `ommm-account-section`. */
export const PROFILE_SECTION_CARD_SHADOW = platformShadow({
  color: "#2d2823",
  offsetHeight: 20,
  opacity: 0.15,
  radius: 22,
  elevation: 5,
});

/** Web: `ommm-account-section` glass blur strength. */
export const PROFILE_GLASS_BLUR_INTENSITY = 50;

/** Web: `ommm-account-section` outer frame. */
export const profileGlassCardFrame: ViewStyle = {
  borderRadius: 28,
  overflow: "hidden",
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: "rgba(255,255,255,0.6)",
  ...PROFILE_SECTION_CARD_SHADOW,
};

/** Light tint over blur — keeps gradient visible through the card. */
export const profileGlassCardTint: ViewStyle = {
  backgroundColor: "rgba(255,255,255,0.38)",
};

export const profileSectionCardBase: ViewStyle = {
  gap: space.md,
  padding: space.lg + 4,
};

export const profileSectionLayout = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    paddingTop: space.sm,
    gap: space.lg,
  },
  pageHeader: {
    gap: 0,
  },
  hubShell: {
    width: "100%",
    maxWidth: 512,
    alignSelf: "center",
    gap: space.xl,
  },
  /** Same hero title treatment as Packages / Schedule mobile pages. */
  pageTitle: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: SCHEDULE_PAGE_MOBILE.pageTitleSizePx,
    lineHeight: SCHEDULE_PAGE_MOBILE.pageTitleLineHeightPx,
    letterSpacing: -0.88,
    color: scheduleColors.pageTitle,
  },
  sectionCard: profileSectionCardBase,
  sectionTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.ink,
  },
  sectionLead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: "rgba(107,114,110,0.95)",
  },
  fieldLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    lineHeight: 18,
    color: "#434843",
  },
  feedbackOk: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: "rgba(107,114,110,0.95)",
  },
  feedbackErr: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  primaryBtn: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
    borderRadius: 9999,
    backgroundColor: colors.taupe,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
  },
});
