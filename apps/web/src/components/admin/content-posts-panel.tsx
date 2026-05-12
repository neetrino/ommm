import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";
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
  locale,
  wellnessChrome = false,
}: ContentPostsPanelProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.content" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<ContentAdminRow[]>(
    "/content/admin/posts",
    cookie,
  );

  if (!res.ok) {
    const message =
      res.status === 401 || res.status === 403
        ? t("errorAuth")
        : t("errorLoad", { status: res.status });
    return wellnessChrome ? (
      <div className="app-alert-warn max-w-xl">{message}</div>
    ) : (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {message}
      </div>
    );
  }

  const list = (
    <ul className={wellnessChrome ? "mt-2 space-y-3" : "mt-6 space-y-2"}>
      {res.data.map((p) => (
        <li
          key={p.id}
          className={
            wellnessChrome
              ? "ommm-list-row"
              : "rounded-[22px] border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
          }
        >
          <div>
            <span
              className={
                wellnessChrome
                  ? "font-medium text-sage-800"
                  : "font-medium text-zinc-900"
              }
            >
              {p.title}
            </span>
            <span
              className={
                wellnessChrome ? "ml-2 text-xs text-sage-500" : "ml-2 text-xs text-zinc-500"
              }
            >
              {p.type} · {p.status}
            </span>
            <p className={wellnessChrome ? "text-xs text-sage-500" : "text-xs text-zinc-500"}>
              {t("postMeta", {
                slug: p.slug,
                time: new Date(p.updatedAt).toLocaleString(locale),
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

  if (wellnessChrome) {
    return (
      <AccountPageFrame title={t("title")} description={t("description")}>
        {list}
      </AccountPageFrame>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
      <p className="mt-2 text-sm text-zinc-600">{t("description")}</p>
      {list}
    </div>
  );
}
