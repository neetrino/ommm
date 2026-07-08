import { StyleSheet } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { profileSectionCardBase, profileSectionLayout } from "../profileSectionLayout";
import { colors, radii, space, typography } from "../../../theme/tokens";

export const PROFILE_PHOTO_PREVIEW_HEIGHT = 200;

const HUB_AVATAR_FILL = "rgba(151,144,124,0.77)";
const HUB_ROW_LABEL = "#2d3530";

export const profileHomeImageSectionStyles = StyleSheet.create({
  card: profileSectionCardBase,
  sectionTitle: {
    ...profileSectionLayout.sectionTitle,
  },
  sectionLead: {
    ...profileSectionLayout.sectionLead,
  },
  previewWrap: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: HUB_AVATAR_FILL,
  },
  previewWrapPending: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.overlayGreen20,
  },
  previewImage: {
    width: "100%",
    height: PROFILE_PHOTO_PREVIEW_HEIGHT,
  },
  initialsPreviewWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: PROFILE_PHOTO_PREVIEW_HEIGHT,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: HUB_AVATAR_FILL,
  },
  initialsPreviewText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.sectionTitle + 12,
    color: HUB_ROW_LABEL,
  },
  pendingHint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.bodyMuted,
    fontStyle: "italic",
  },
  feedbackOk: {
    ...profileSectionLayout.feedbackOk,
  },
  feedbackErr: {
    ...profileSectionLayout.feedbackErr,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    alignItems: "center",
  },
  secondaryBtn: {
    flexGrow: 1,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  secondaryPressed: {
    opacity: 0.88,
  },
  primaryBtn: {
    flexGrow: 1,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
  },
  primaryPressed: {
    opacity: 0.92,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  removeLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  primaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
  },
});
