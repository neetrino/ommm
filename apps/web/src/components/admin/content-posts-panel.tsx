import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ContentPostsManagement } from "@/components/shared/content/content-posts-management";
import type { ContentPostRow } from "@/components/shared/content/content-post-types";
import { serverApiJson } from "@/lib/server-api";

export async function ContentPostsPanel() {
  const t = await getTranslations("contentAdminPages.content");
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<ContentPostRow[]>("/content/admin/posts", cookie);

  if (!res.ok) {
    const message =
      res.status === 401 || res.status === 403
        ? t("errorAuth")
        : t("errorLoad", { status: res.status });
    return <div className="app-alert-warn max-w-xl">{message}</div>;
  }

  return <ContentPostsManagement items={res.data} />;
}
