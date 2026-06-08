"use client";

import { useTranslations } from "next-intl";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import { memberAccountHubLayout } from "@/components/account/member-account-hub-layout";
import { MemberAccountHubChevron } from "@/components/account/member-account-hub-chevron";
import { LogoutButton } from "@/components/logout-button";

const MENU_ROW_BASE = memberAccountHubLayout.menuRow;

const DELETE_ROW_CLASS = [
  MENU_ROW_BASE,
  memberAccountHubLayout.menuRowDanger,
  memberAccountHubLayout.sectionDivider,
].join(" ");

const LOGOUT_ROW_CLASS = [MENU_ROW_BASE, memberAccountHubLayout.menuRowDanger].join(
  " ",
);

function HubTrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function deleteRowContent(label: string) {
  return (
    <>
      <span className={memberAccountHubLayout.menuRowIcon}>
        <HubTrashIcon />
      </span>
      <span className={memberAccountHubLayout.menuRowLabel}>{label}</span>
      <MemberAccountHubChevron
        className={memberAccountHubLayout.menuRowDangerChevron}
      />
    </>
  );
}

export function MemberAccountHubActionRows() {
  const tProfile = useTranslations("userPages.profile");

  return (
    <>
      <DeleteAccountButton
        bare
        triggerClassName={DELETE_ROW_CLASS}
        triggerContent={deleteRowContent(tProfile("deleteAccount"))}
        busyTriggerContent={deleteRowContent(tProfile("deleteAccountDeleting"))}
      />

      <LogoutButton
        showLabel
        hideIcon
        leadingSpacerClassName={memberAccountHubLayout.menuRowIcon}
        className={LOGOUT_ROW_CLASS}
        labelClassName={memberAccountHubLayout.menuRowLabel}
        spinnerClassName="h-5 w-5"
        trailing={
          <MemberAccountHubChevron
            className={memberAccountHubLayout.menuRowDangerChevron}
          />
        }
      />
    </>
  );
}
