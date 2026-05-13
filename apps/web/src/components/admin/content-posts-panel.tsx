import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";
import { ContentPostsPanelClient } from "@/components/admin/content-posts-panel-client";
import { AccountPageFrame } from "@/components/layout/account-page-frame";

type ContentAdminRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  updatedAt: string;
};

type ContentPostsPanelProps = {
  locale: string;
  /** When true (admin workspace), match member dashboard glass surfaces. */
  wellnessChrome?: boolean;
};

export async function ContentPostsPanel({
  locale: _locale,
  wellnessChrome = false,
}: ContentPostsPanelProps) {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<ContentAdminRow[]>(
    "/content/admin/posts",
    cookie,
  );

  if (!res.ok) {
    const message =
      res.status === 401 || res.status === 403
        ? "Admin or content role required."
        : `Could not load posts (${res.status}).`;
    return wellnessChrome ? (
      <div className="app-alert-warn max-w-xl">{message}</div>
    ) : (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {message}
      </div>
    );
  }

  const list = <ContentPostsPanelClient items={res.data} wellnessChrome={wellnessChrome} />;

  if (wellnessChrome) {
    return (
      <AccountPageFrame title="Content" description="Manage posts and visibility states.">
        {list}
      </AccountPageFrame>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Content</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Manage posts and visibility states.
      </p>
      {list}
    </div>
  );
}
