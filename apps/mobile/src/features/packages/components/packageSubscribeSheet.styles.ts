import { StyleSheet } from "react-native";
import { PACKAGES_PRIMARY_CTA } from "../../../lib/packages/packagesPageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../theme/tokens";

const SHEET_TITLE_COLOR = "rgba(151, 144, 124, 0.85)";
const SECTION_LABEL = "#434843";
const PLAN_TITLE = "#3d4a42";
const PLAN_META = "rgba(61, 74, 66, 0.72)";
const GIFT_ICON = "#5f5848";
const GIFT_HINT = "#7a7264";
const METHOD_BORDER = "rgba(151, 144, 124, 0.55)";
/** Web `.ommm-cta-secondary` — `border-sand-500/25`. */
const CANCEL_BORDER = "rgba(161, 150, 133, 0.25)";
/** Web `text-sage-700`. */
const CANCEL_LABEL = colors.primaryGreen;

const ctaShadow = platformShadow({
  color: PACKAGES_PRIMARY_CTA.shadowColor,
  offsetHeight: PACKAGES_PRIMARY_CTA.shadowOffsetHeightPx,
  opacity: PACKAGES_PRIMARY_CTA.shadowOpacity,
  radius: PACKAGES_PRIMARY_CTA.shadowRadiusPx,
  elevation: PACKAGES_PRIMARY_CTA.androidElevation,
});

export const packageSubscribeSheetStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrimDark,
  },
  sheet: {
    zIndex: 1,
    maxHeight: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 20,
    paddingTop: 10,
    overflow: "hidden",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: -8,
      opacity: 0.18,
      radius: 28,
      elevation: 8,
    }),
  },
  grabber: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 9999,
    backgroundColor: "rgba(151, 144, 124, 0.35)",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBottom: space.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: SHEET_TITLE_COLOR,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(151, 144, 124, 0.22)",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: space.md,
    paddingBottom: space.sm,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: SECTION_LABEL,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: space.md,
    gap: 4,
  },
  planName: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: PLAN_TITLE,
  },
  planPrice: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  planMeta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 13,
    lineHeight: 18,
    color: PLAN_META,
  },
  giftBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(247, 243, 234, 0.78)",
    paddingHorizontal: space.md,
    paddingVertical: 14,
  },
  giftBlockActive: {
    borderColor: METHOD_BORDER,
    backgroundColor: "rgba(236, 240, 230, 0.9)",
  },
  giftBlockEmpty: {
    opacity: 0.9,
  },
  giftIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(151, 144, 124, 0.22)",
    backgroundColor: "rgba(255,255,255,0.78)",
  },
  giftCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  giftTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    color: "#2f2a24",
  },
  giftHint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 12,
    lineHeight: 16,
    color: GIFT_HINT,
  },
  giftBadge: {
    alignSelf: "flex-start",
    marginTop: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(151, 144, 124, 0.28)",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  giftBadgeText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    color: "#4d4638",
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: METHOD_BORDER,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  methodLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 14,
    color: SECTION_LABEL,
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space.sm,
    paddingTop: space.md,
  },
  /** Web `OmmButton` secondary → `.ommm-cta-secondary`. */
  cancelBtn: {
    flexShrink: 0,
    minHeight: PACKAGES_PRIMARY_CTA.minHeightPx,
    paddingHorizontal: PACKAGES_PRIMARY_CTA.paddingHorizontalPx,
    paddingVertical: PACKAGES_PRIMARY_CTA.paddingVerticalPx,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: CANCEL_BORDER,
    backgroundColor: "rgba(255,255,255,0.85)",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 1,
      opacity: 0.08,
      radius: 2,
      elevation: 1,
    }),
  },
  cancelLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: PACKAGES_PRIMARY_CTA.fontSizePx,
    letterSpacing: PACKAGES_PRIMARY_CTA.letterSpacingPx,
    textTransform: "uppercase",
    color: CANCEL_LABEL,
  },
  /** Web `OmmButton` primary → `.ommm-cta-primary`. */
  confirmBtn: {
    flexShrink: 0,
    minHeight: PACKAGES_PRIMARY_CTA.minHeightPx,
    paddingHorizontal: PACKAGES_PRIMARY_CTA.paddingHorizontalPx,
    paddingVertical: PACKAGES_PRIMARY_CTA.paddingVerticalPx,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.taupe,
    ...ctaShadow,
  },
  confirmDisabled: {
    opacity: 0.45,
  },
  confirmLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: PACKAGES_PRIMARY_CTA.fontSizePx,
    letterSpacing: PACKAGES_PRIMARY_CTA.letterSpacingPx,
    textTransform: "uppercase",
    color: colors.white,
  },
  pressed: {
    opacity: 0.92,
  },
  giftIconColor: {
    color: GIFT_ICON,
  },
});
