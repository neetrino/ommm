import type { DashboardNavIcon } from "@/lib/dashboard-nav";
import type { HomePageSectionKey } from "@/lib/home-page-sections";

const HOME_SECTION_ICON_BY_KEY: Record<HomePageSectionKey, DashboardNavIcon> = {
  home: "home",
  story: "fileText",
  schedule: "calendar",
  presalePackages: "tag",
  memberships: "tag",
  coaches: "userCheck",
  explore: "layoutGrid",
  contact: "send",
};

/** Dashboard icon slug for each marketing home section row. */
export function homeSectionDashboardIcon(key: HomePageSectionKey): DashboardNavIcon {
  return HOME_SECTION_ICON_BY_KEY[key];
}
