import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";

type ContentAdminRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  updatedAt: string;
};

export async function ContentPostsPanel() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<ContentAdminRow[]>(
    "/content/admin/posts",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Admin or content role required."
          : `Could not load posts (${res.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Content</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Manage posts via API or extend this table with edit actions.
      </p>
      <ul className="mt-6 space-y-2">
        {res.data.map((p) => (
          <li
            key={p.id}
            className="rounded-[22px] border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
          >
            <span className="font-medium text-zinc-900">{p.title}</span>
            <span className="ml-2 text-xs text-zinc-500">
              {p.type} · {p.status}
            </span>
            <p className="text-xs text-zinc-500">
              /{p.slug} · updated {new Date(p.updatedAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
