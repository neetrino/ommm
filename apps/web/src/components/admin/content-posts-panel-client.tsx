"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

type ContentAdminRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  updatedAt: string;
};

type ContentPostsPanelClientProps = {
  items: ContentAdminRow[];
  wellnessChrome?: boolean;
};

const CONTENT_TYPES = ["EVENT", "BLOG", "NEWS", "UPDATE", "KNOWLEDGE_ARTICLE"] as const;
const CONTENT_STATUS = ["DRAFT", "PUBLISHED", "HIDDEN"] as const;
const TYPE_OPTIONS: readonly DropdownOption<(typeof CONTENT_TYPES)[number]>[] = CONTENT_TYPES.map(
  (value) => ({ value, label: value }),
);
const STATUS_OPTIONS: readonly DropdownOption<(typeof CONTENT_STATUS)[number]>[] =
  CONTENT_STATUS.map((value) => ({ value, label: value }));

export function ContentPostsPanelClient({
  items,
  wellnessChrome = false,
}: ContentPostsPanelClientProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<(typeof CONTENT_TYPES)[number]>("BLOG");
  const [status, setStatus] = useState<(typeof CONTENT_STATUS)[number]>("DRAFT");
  const [body, setBody] = useState("");

  async function run(
    id: string,
    action: () => Promise<void>,
    okLabel: string,
  ): Promise<void> {
    if (busyId) {
      return;
    }
    setBusyId(id);
    setMessage(null);
    try {
      await action();
      setMessage(okLabel);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <form
        className="grid gap-2 sm:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          void run(
            "__create__",
            () =>
              apiFetch("/content/admin/posts", {
                method: "POST",
                body: JSON.stringify({
                  title,
                  slug,
                  type,
                  status,
                  body,
                }),
              }),
            "Post created",
          );
        }}
      >
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs"
          placeholder="Slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
        <DropdownSelect
          label="Type"
          ariaLabel="Content type"
          name="type"
          value={type}
          options={TYPE_OPTIONS}
          onChange={setType}
          disabled={busyId !== null}
          required
          triggerClassName="h-9 min-h-9 text-xs"
          menuClassName="text-xs"
        />
        <DropdownSelect
          label="Status"
          ariaLabel="Content status"
          name="status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
          disabled={busyId !== null}
          required
          triggerClassName="h-9 min-h-9 text-xs"
          menuClassName="text-xs"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 text-xs text-slate-700 hover:bg-slate-50"
          disabled={busyId !== null}
        >
          Create
        </button>
        <textarea
          className="app-input min-h-20 text-xs sm:col-span-6"
          placeholder="Body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </form>

      <ul className={wellnessChrome ? "mt-2 space-y-3" : "mt-6 space-y-2"}>
        {items.map((p) => (
          <li
            key={p.id}
            className={
              wellnessChrome
                ? "ommm-list-row"
                : "rounded-[22px] border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
            }
          >
            <div className="w-full">
              <div className="flex items-start justify-between gap-4">
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
                      wellnessChrome
                        ? "ml-2 text-xs text-sage-500"
                        : "ml-2 text-xs text-zinc-500"
                    }
                  >
                    {p.type} · {p.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    disabled={busyId !== null}
                    onClick={() =>
                      void run(
                        p.id,
                        () =>
                          apiFetch(`/content/admin/posts/${p.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({
                              title: p.title,
                              slug: p.slug,
                              type: p.type,
                              status: p.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN",
                              body: "",
                            }),
                          }),
                        "Visibility updated",
                      )
                    }
                  >
                    Toggle hide
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                    disabled={busyId !== null}
                    onClick={() =>
                      void run(
                        p.id,
                        () =>
                          apiFetch(`/content/admin/posts/${p.id}`, {
                            method: "DELETE",
                          }),
                        "Post deleted",
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className={wellnessChrome ? "text-xs text-sage-500" : "text-xs text-zinc-500"}>
                /{p.slug} · {new Date(p.updatedAt).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {message ? <p className="text-xs text-sage-700">{message}</p> : null}
    </div>
  );
}
