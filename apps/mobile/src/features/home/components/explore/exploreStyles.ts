import { StyleSheet } from "react-native";
import { fontFamilies } from "../../../../theme/fontFamilies";
import { platformShadow, platformTextShadow } from "../../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../../theme/tokens";
import { EXPLORE_JOURNAL_GLASS_BASE } from "./exploreConstants";

export const exploreStyles = StyleSheet.create({
  section: {
    paddingHorizontal: space.screenHorizontal,
    marginBottom: space.section,
    gap: space.section + space.md,
  },
  titleWrap: {
    justifyContent: "flex-end",
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.exploreTitle,
    zIndex: 1,
  },
  featured: {
    position: "relative",
    marginBottom: space.xl,
  },
  heroImageWrap: {
    width: "100%",
    aspectRatio: 16 / 11,
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  labelCardOuter: {
    position: "absolute",
    left: space.lg,
    right: space.lg,
    bottom: -space.lg,
    borderRadius: radii.labelCard,
    ...platformShadow({
      color: "#d8e4ef",
      offsetHeight: 6,
      opacity: 0.38,
      radius: 18,
      elevation: 10,
    }),
  },
  labelBlur: {
    borderRadius: radii.labelCard,
    overflow: "hidden",
    backgroundColor: EXPLORE_JOURNAL_GLASS_BASE,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  labelGlassSheen: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  labelTopEdgeSheen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    pointerEvents: "none",
  },
  labelInner: {
    position: "relative",
    zIndex: 1,
    padding: space.lg,
  },
  labelTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 0.5,
  },
  eyebrow: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: typography.caption,
    lineHeight: 16,
    letterSpacing: 1.2,
    color: colors.white,
    textTransform: "uppercase",
    ...platformTextShadow({
      color: "rgba(0,0,0,0.35)",
      offsetHeight: 1,
      radius: 5,
    }),
  },
  journalTitle: {
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.white,
    ...platformTextShadow({
      color: "rgba(0,0,0,0.4)",
      offsetHeight: 1,
      radius: 8,
    }),
  },
  tileGrid: {
    flexDirection: "row",
    gap: space.md,
    marginTop: space.xl,
    overflow: "visible",
  },
  tileCol: {
    flex: 1,
    minWidth: 0,
    alignItems: "stretch",
  },
  tileImageWrap: {
    overflow: "hidden",
    width: "100%",
    backgroundColor: colors.white,
  },
  tileImageRoundedSquare: {
    aspectRatio: 1,
  },
  pilatesClip: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.white,
    pointerEvents: "none",
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileTagRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    pointerEvents: "none",
  },
  tileTagRowLeading: {
    justifyContent: "flex-start",
  },
  tileTagRowCentered: {
    justifyContent: "center",
  },
  tileTag: {
    borderRadius: radii.pill,
  },
  tileTagLight: {
    backgroundColor: colors.white,
  },
  tileTagDark: {
    backgroundColor: colors.studioPill,
  },
  tileTagText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.micro,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  tileTagTextLight: {
    color: colors.ink,
  },
  tileTagTextDark: {
    color: colors.white,
  },
  tileTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.tileTitle,
    paddingHorizontal: space.xxs,
  },
  tileTitleCentered: {
    textAlign: "center",
  },
});
