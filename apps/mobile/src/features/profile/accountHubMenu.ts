import { useMemo } from "react";
import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslations } from "../../i18n/I18nProvider";
import { coachPath, userMemberPath } from "../../navigation/memberPaths";

type AccountHubMenuIcon = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type AccountHubMenuItem = {
  key: string;
  label: string;
  href: string;
  icon: AccountHubMenuIcon;
};

export type AccountHubRole = "USER" | "COACH";

function pathForRole(role: AccountHubRole, segment: string): string {
  return role === "COACH" ? coachPath(segment) : userMemberPath(segment);
}

export function useAccountHubMenuItems(
  role: AccountHubRole = "USER",
): AccountHubMenuItem[] {
  const tHub = useTranslations("userPages.accountHub");
  const tProfile = useTranslations("userPages.profile");

  return useMemo(
    () => [
      {
        key: "personal",
        label: tProfile("accountInfo"),
        href: pathForRole(role, "profile/personal"),
        icon: "account-outline",
      },
      {
        key: "password",
        label: tHub("changePassword"),
        href: pathForRole(role, "profile/change-password"),
        icon: "lock-outline",
      },
    ],
    [role, tHub, tProfile],
  );
}
