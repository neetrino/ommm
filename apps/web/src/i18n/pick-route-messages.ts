import { localeFreePathFromRequestPathname } from "@/lib/marketing-path-from-request";

/** Always shipped — header, footer, shared chrome. */
export const MESSAGE_SHELL_KEYS = [
  "common",
  "nav",
  "footer",
  "marketingUi",
  "language",
  "headerNotifications",
  "listSort",
] as const;

type MessagesRecord = Record<string, unknown>;

type RouteMessageRule = {
  readonly prefix: string;
  readonly keys: readonly string[];
};

const ROUTE_MESSAGE_RULES: readonly RouteMessageRule[] = [
  {
    prefix: "/admin",
    keys: ["adminPages", "adminHome", "adminActions", "forms", "staffProfile"],
  },
  {
    prefix: "/manager",
    keys: ["managerPages", "adminActions", "forms", "staffProfile"],
  },
  {
    prefix: "/coach",
    keys: ["coachPages", "forms", "staffProfile", "dashboard"],
  },
  {
    prefix: "/content-admin",
    keys: ["contentAdminPages", "staffProfile", "dashboard"],
  },
  {
    prefix: "/user",
    keys: ["userPages", "account", "dashboard", "forms", "marketing"],
  },
  {
    prefix: "/account",
    keys: ["account", "userPages", "dashboard", "forms"],
  },
  {
    prefix: "/dashboard",
    keys: ["dashboard", "account", "userPages"],
  },
  {
    prefix: "/payment",
    keys: ["userPages", "forms", "marketing", "account"],
  },
  {
    prefix: "/login",
    keys: ["auth", "forms"],
  },
  {
    prefix: "/register",
    keys: ["auth", "forms"],
  },
  {
    prefix: "/forgot-password",
    keys: ["auth", "forms"],
  },
  {
    prefix: "/reset-password",
    keys: ["auth", "forms"],
  },
  {
    prefix: "/set-password",
    keys: ["auth", "forms", "account"],
  },
  {
    prefix: "/verify-email",
    keys: ["verifyEmail", "auth"],
  },
];

const MARKETING_MESSAGE_KEYS = [
  "home",
  "marketingPublic",
  "marketing",
  "marketingPages",
  "forms",
  "userPages",
  "account",
  "dashboard",
] as const;

function resolveMessageKeyList(localeFreePath: string): readonly string[] {
  for (const rule of ROUTE_MESSAGE_RULES) {
    if (
      localeFreePath === rule.prefix ||
      localeFreePath.startsWith(`${rule.prefix}/`)
    ) {
      return [...MESSAGE_SHELL_KEYS, ...rule.keys];
    }
  }

  return [...MESSAGE_SHELL_KEYS, ...MARKETING_MESSAGE_KEYS];
}

function pickMessageKeys(
  allMessages: MessagesRecord,
  keys: readonly string[],
): MessagesRecord {
  const picked: MessagesRecord = {};
  for (const key of keys) {
    if (key in allMessages) {
      picked[key] = allMessages[key];
    }
  }
  return picked;
}

/** Route-aware subset of locale messages for smaller client hydration. */
export function pickRouteMessages(
  pathname: string | null,
  allMessages: MessagesRecord,
): MessagesRecord {
  if (pathname === null) {
    return allMessages;
  }
  const localeFreePath = localeFreePathFromRequestPathname(pathname);
  const keys = resolveMessageKeyList(localeFreePath);
  return pickMessageKeys(allMessages, keys);
}
