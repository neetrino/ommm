import { useMemo } from "react";
import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslations } from "../../i18n/I18nProvider";
import { userMemberPath } from "../../navigation/memberPaths";

type AccountHubMenuIcon = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type AccountHubMenuItem = {
  key: string;
  label: string;
  href: string;
  icon: AccountHubMenuIcon;
};

export function useAccountHubMenuItems(): AccountHubMenuItem[] {
  const tHub = useTranslations("userPages.accountHub");
  const tProfile = useTranslations("userPages.profile");

  return useMemo(
    () => [
      {
        key: "personal",
        label: tProfile("accountInfo"),
        href: userMemberPath("profile/personal"),
        icon: "account-outline",
      },
      {
        key: "password",
        label: tHub("changePassword"),
        href: userMemberPath("profile/change-password"),
        icon: "lock-outline",
      },
    ],
    [tHub, tProfile],
  );
}
