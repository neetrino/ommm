import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";
import { userMemberPath } from "../../navigation/memberPaths";

type AccountHubMenuIcon = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type AccountHubMenuItem = {
  key: string;
  label: string;
  href: string;
  icon: AccountHubMenuIcon;
};

export const ACCOUNT_HUB_MENU_ITEMS: AccountHubMenuItem[] = [
  { key: "home", label: "Home", href: userMemberPath("home"), icon: "home-outline" },
  {
    key: "schedule",
    label: "Schedule",
    href: userMemberPath("schedule"),
    icon: "calendar-month-outline",
  },
  {
    key: "bookings",
    label: "My Bookings",
    href: userMemberPath("classes"),
    icon: "clipboard-check-outline",
  },
  {
    key: "plans",
    label: "Plans",
    href: userMemberPath("progress"),
    icon: "layers-outline",
  },
  {
    key: "personal",
    label: "Personal information",
    href: userMemberPath("profile/personal"),
    icon: "account-outline",
  },
  {
    key: "password",
    label: "Change password",
    href: userMemberPath("profile/change-password"),
    icon: "lock-outline",
  },
];
