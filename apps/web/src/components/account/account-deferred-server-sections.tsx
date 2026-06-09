import dynamic from "next/dynamic";
import { MemberPageContentSkeleton } from "@/components/account/member-page-content-skeleton";

export const MemberDashboardDeferred = dynamic(
  () =>
    import("@/components/account/member-dashboard").then((module) => module.MemberDashboard),
  {
    loading: () => <MemberPageContentSkeleton rows={4} />,
  },
);

export const MemberUserHomePageContentDeferred = dynamic(
  () =>
    import("@/components/account/member-user-home-page-content").then(
      (module) => module.MemberUserHomePageContent,
    ),
  {
    loading: () => <MemberPageContentSkeleton rows={4} />,
  },
);
