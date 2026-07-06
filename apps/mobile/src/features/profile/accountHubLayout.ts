import { Platform, StyleSheet } from "react-native";
import { fontFamilies } from "../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../theme/tokens";

/** Shared OMMM styling for the mobile account hub menu. */
export const ACCOUNT_HUB_AVATAR_SIZE = 72;

export const accountHubLayout = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  avatarWrap: {
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.white,
    padding: 3,
    backgroundColor: colors.cardTint,
    ...Platform.select({
      ios: {
        shadowColor: "#2d2823",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  avatarRing: {
    width: ACCOUNT_HUB_AVATAR_SIZE,
    height: ACCOUNT_HUB_AVATAR_SIZE,
    borderRadius: radii.pill,
    overflow: "hidden",
    backgroundColor: "rgba(212,163,115,0.22)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.taupe,
  },
  avatarInitials: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Manrope_600SemiBold",
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle + 2,
    lineHeight: 28,
    color: colors.primaryGreen,
  },
  email: {
    marginTop: space.xxs,
    fontFamily: "Manrope_400Regular",
    fontSize: typography.caption,
    lineHeight: 18,
    color: colors.bodyMuted,
  },
  menuCard: {
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.95)",
    ...Platform.select({
      ios: {
        shadowColor: "#2d2823",
        shadowOffset: { width: 0, height: 22 },
        shadowOpacity: 0.14,
        shadowRadius: 28,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg + 4,
    paddingVertical: space.md + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.72)",
  },
  menuRowPressed: {
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuRowDanger: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(151,144,124,0.22)",
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 28,
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontFamily: "Manrope_600SemiBold",
    fontSize: typography.bodySmall + 1,
    lineHeight: 22,
    color: colors.secondarySage,
  },
  labelDanger: {
    color: colors.danger,
  },
  logoutRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(151,144,124,0.22)",
  },
});
