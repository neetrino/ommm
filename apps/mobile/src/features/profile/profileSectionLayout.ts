import { Platform, StyleSheet, type ViewStyle } from "react-native";
import { fontFamilies } from "../../theme/fontFamilies";
import { colors, space, typography } from "../../theme/tokens";

/** Web: `ommm-account-section`. */
export const PROFILE_SECTION_CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#2d2823",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
  },
  android: { elevation: 5 },
  default: {},
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
    paddingHorizontal: space.screenHorizontal,
    paddingTop: space.sm,
    gap: space.lg,
  },
  backRow: {
    alignSelf: "flex-start",
    marginBottom: -space.xs,
  },
  hubShell: {
    width: "100%",
    maxWidth: 512,
    alignSelf: "center",
    gap: space.xl,
  },
  pageTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle + 4,
    lineHeight: 30,
    color: colors.ink,
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
    backgroundColor: colors.primaryGreen,
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
