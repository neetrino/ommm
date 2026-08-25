import { StyleSheet } from "react-native";
import { fontFamilies } from "../../theme/fontFamilies";
import { platformShadow } from "../../theme/platformShadow";
import { colors, space } from "../../theme/tokens";
import {
  MEMBER_PROFILE_AVATAR_FILL,
  MEMBER_PROFILE_AVATAR_INITIALS_COLOR,
  memberProfileAvatarInitialsFontSize,
} from "./memberProfileAvatarTokens";

/** Shared OMMM styling — aligned with web `ommm-member-account-hub-*`. */
export const ACCOUNT_HUB_AVATAR_SIZE = 68;

const HUB_OLIVE_ICON = "#97907c";
const HUB_ROW_LABEL = MEMBER_PROFILE_AVATAR_INITIALS_COLOR;
const HUB_ROW_CHEVRON = "rgba(161,150,133,0.9)";
const HUB_AVATAR_FILL = MEMBER_PROFILE_AVATAR_FILL;
const HUB_ROW_BORDER = "rgba(255,255,255,0.7)";
const HUB_DANGER_BORDER = "rgba(245,245,244,0.8)";
const HUB_DANGER_TEXT = "#7f1d1d";
const HUB_DANGER_CHEVRON = "rgba(185, 28, 28, 0.75)";
const HUB_NAME_SIZE = 26;
const HUB_NAME_LINE_HEIGHT = 32;
const HUB_NAME_LETTER_SPACING = -0.45;

export const accountHubIconColor = HUB_OLIVE_ICON;
export const accountHubChevronColor = HUB_ROW_CHEVRON;
export const accountHubDangerChevronColor = HUB_DANGER_CHEVRON;
export const accountHubDangerTextColor = HUB_DANGER_TEXT;

export const accountHubLayout = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  avatarWrap: {
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    padding: 3,
    overflow: "hidden",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 10,
      opacity: 0.2,
      radius: 14,
      elevation: 4,
    }),
  },
  avatarRing: {
    width: ACCOUNT_HUB_AVATAR_SIZE,
    height: ACCOUNT_HUB_AVATAR_SIZE,
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: HUB_AVATAR_FILL,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: HUB_AVATAR_FILL,
  },
  avatarInitialsShell: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialsText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: memberProfileAvatarInitialsFontSize(ACCOUNT_HUB_AVATAR_SIZE),
    lineHeight: memberProfileAvatarInitialsFontSize(ACCOUNT_HUB_AVATAR_SIZE) + 4,
    color: HUB_ROW_LABEL,
    textAlign: "center",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: HUB_NAME_SIZE,
    lineHeight: HUB_NAME_LINE_HEIGHT,
    letterSpacing: HUB_NAME_LETTER_SPACING,
    color: colors.primaryGreen,
  },
  nameSurname: {
    fontFamily: fontFamilies.gtSuperDs.lightItalic,
    fontSize: HUB_NAME_SIZE,
    lineHeight: HUB_NAME_LINE_HEIGHT,
    letterSpacing: HUB_NAME_LETTER_SPACING,
    color: colors.primaryGreen,
  },
  menuCard: {
    overflow: "hidden",
  },
  languageRow: {
    marginTop: space.md,
    marginBottom: space.sm,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: space.md,
  },
  menuRowBorderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HUB_ROW_BORDER,
  },
  menuRowPressed: {
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  menuRowDanger: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HUB_DANGER_BORDER,
  },
  menuRowDangerPressed: {
    backgroundColor: "rgba(254, 242, 242, 0.7)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 15,
    lineHeight: 22,
    color: HUB_ROW_LABEL,
  },
  labelDanger: {
    color: HUB_DANGER_TEXT,
  },
  logoutRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HUB_DANGER_BORDER,
  },
});
