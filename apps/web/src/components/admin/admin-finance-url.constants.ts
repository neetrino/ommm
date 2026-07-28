import type { FinanceSectionId } from "@/components/admin/admin-finance-module";
import {
  CLIENT_ADD_PACKAGE_QUERY_KEY,
  CLIENT_PROFILE_TAB_QUERY_KEY,
} from "@/components/admin/admin-client-sheet-tabs";

export const FINANCE_OVERVIEW_QUERY_KEYS = ["rangeDays"] as const;

export const FINANCE_PAYMENTS_QUERY_KEYS = [
  "q",
  "rangeDays",
  "source",
  "status",
  "planId",
  "packageClass",
  "sessions",
  "order",
  "payPage",
  "payPageSize",
] as const;

export const FINANCE_MEMBERS_QUERY_KEYS = [
  "q",
  "paymentStatus",
  "order",
  "giftCardOnly",
  "quick",
  "userPage",
  "userPageSize",
] as const;

/** Client sheet UI keys — kept on members so tab switches do not trigger sanitize redirect. */
export const FINANCE_MEMBERS_UI_QUERY_KEYS = [
  CLIENT_PROFILE_TAB_QUERY_KEY,
  CLIENT_ADD_PACKAGE_QUERY_KEY,
] as const;

export const FINANCE_COACHES_QUERY_KEYS = [
  "q",
  "month",
  "payoutStatus",
  "order",
  "quick",
  "coachPage",
  "coachPageSize",
] as const;

/** @deprecated Use tab-specific query keys. */
export const FINANCE_FILTER_QUERY_KEYS = FINANCE_PAYMENTS_QUERY_KEYS;

export const FINANCE_USER_PAGE_KEYS = {
  pageKey: "userPage",
  pageSizeKey: "userPageSize",
} as const;

export const FINANCE_PAYMENTS_PAGE_KEYS = {
  pageKey: "payPage",
  pageSizeKey: "payPageSize",
} as const;

export const FINANCE_COACH_PAGE_KEYS = {
  pageKey: "coachPage",
  pageSizeKey: "coachPageSize",
} as const;

export const FINANCE_LEGACY_QUERY_KEYS = ["tab"] as const;

export const FINANCE_ALL_QUERY_KEYS = [
  ...new Set([
    ...FINANCE_OVERVIEW_QUERY_KEYS,
    ...FINANCE_PAYMENTS_QUERY_KEYS,
    ...FINANCE_MEMBERS_QUERY_KEYS,
    ...FINANCE_MEMBERS_UI_QUERY_KEYS,
    ...FINANCE_COACHES_QUERY_KEYS,
    ...FINANCE_LEGACY_QUERY_KEYS,
  ]),
] as const;

/** Query keys allowed on a finance tab route. */
export function getFinanceSectionQueryKeys(section: FinanceSectionId): readonly string[] {
  switch (section) {
    case "overview":
      return FINANCE_OVERVIEW_QUERY_KEYS;
    case "payments":
      return FINANCE_PAYMENTS_QUERY_KEYS;
    case "members":
      return [...FINANCE_MEMBERS_QUERY_KEYS, ...FINANCE_MEMBERS_UI_QUERY_KEYS];
    case "coaches":
      return FINANCE_COACHES_QUERY_KEYS;
  }
}
