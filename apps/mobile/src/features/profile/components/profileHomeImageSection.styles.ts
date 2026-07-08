import { StyleSheet } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

export const PROFILE_PHOTO_PREVIEW_HEIGHT = 200;

export const profileHomeImageSectionStyles = StyleSheet.create({
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite38,
  },
  sectionTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  sectionLead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.secondarySage,
  },
  previewWrap: {
    borderRadius: radii.labelCard,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.primaryGreen,
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
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: "rgba(212,163,115,0.22)",
  },
  initialsPreviewText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.sectionTitle + 12,
    color: colors.primaryGreen,
  },
  pendingHint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.bodyMuted,
    fontStyle: "italic",
  },
  feedbackOk: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  feedbackErr: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.danger,
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
    borderColor: colors.overlayGreen20,
    backgroundColor: colors.overlayWhite20,
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
