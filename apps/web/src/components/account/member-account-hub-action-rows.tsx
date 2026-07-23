"use client";

import { useTranslations } from "next-intl";
import actionStyles from "@/components/account/member-account-hub-actions.module.css";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import { memberAccountHubLayout } from "@/components/account/member-account-hub-layout";
import { MemberAccountHubChevron } from "@/components/account/member-account-hub-chevron";
import { LogoutButton } from "@/components/logout-button";

const MENU_DELETE_ROW_CLASS = [
  memberAccountHubLayout.menuRow,
  memberAccountHubLayout.menuRowDanger,
  memberAccountHubLayout.sectionDivider,
].join(" ");

const MENU_LOGOUT_ROW_CLASS = [
  memberAccountHubLayout.menuRow,
  memberAccountHubLayout.menuRowDanger,
].join(" ");

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

function deleteMobileContent(label: string) {
  return (
    <>
      <span className={actionStyles.deleteBtnIcon}>
        <HubTrashIcon />
      </span>
      <span className={actionStyles.deleteBtnLabel}>{label}</span>
      <MemberAccountHubChevron className={actionStyles.deleteBtnChevron} />
    </>
  );
}

function deleteMenuRowContent(label: string) {
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

/** Mobile — outline delete card + olive logout pill below the menu card. */
export function MemberAccountHubMobileActionRows() {
  const tProfile = useTranslations("userPages.profile");

  return (
    <div className={actionStyles.actionsFooter}>
      <DeleteAccountButton
        bare
        triggerClassName={actionStyles.deleteBtn}
        triggerContent={deleteMobileContent(tProfile("deleteAccount"))}
        busyTriggerContent={deleteMobileContent(tProfile("deleteAccountDeleting"))}
      />

      <LogoutButton
        showLabel
        iconClassName="h-5 w-5 shrink-0"
        className={actionStyles.logoutBtn}
        labelClassName={actionStyles.logoutBtnLabel}
        spinnerClassName="h-5 w-5"
      />
    </div>
  );
}

/** Desktop hub backdrop — legacy rows inside the white menu card. */
export function MemberAccountHubMenuActionRows() {
  const tProfile = useTranslations("userPages.profile");

  return (
    <>
      <DeleteAccountButton
        bare
        triggerClassName={MENU_DELETE_ROW_CLASS}
        triggerContent={deleteMenuRowContent(tProfile("deleteAccount"))}
        busyTriggerContent={deleteMenuRowContent(tProfile("deleteAccountDeleting"))}
      />

      <LogoutButton
        showLabel
        leadingSpacerClassName={memberAccountHubLayout.menuRowIcon}
        iconClassName="h-5 w-5 shrink-0"
        className={MENU_LOGOUT_ROW_CLASS}
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
