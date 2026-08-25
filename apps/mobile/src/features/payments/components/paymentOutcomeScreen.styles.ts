import { StyleSheet } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, space } from "../../../theme/tokens";

export const paymentOutcomeScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 512,
    width: "100%",
    alignSelf: "center",
  },
  panel: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    alignItems: "center",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 28,
      opacity: 0.22,
      radius: 40,
      elevation: 6,
    }),
  },
  panelInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  panelBody: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconRingFill: {
    ...StyleSheet.absoluteFillObject,
  },
  eyebrow: {
    marginTop: space.lg,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.secondarySage,
    textAlign: "center",
    opacity: 0.72,
  },
  title: {
    marginTop: 12,
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: colors.ink,
    textAlign: "center",
  },
  lead: {
    marginTop: 14,
    maxWidth: 360,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.bodyMuted,
    textAlign: "center",
  },
  actions: {
    marginTop: 28,
    width: "100%",
    gap: space.sm,
    alignItems: "center",
  },
  doneCta: {
    alignSelf: "center",
    minWidth: 180,
  },
  retryGhost: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  retryGhostPressed: {
    opacity: 0.75,
  },
  retryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.primaryGreen,
  },
});
