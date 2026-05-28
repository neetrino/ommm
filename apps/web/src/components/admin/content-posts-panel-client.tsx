"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

type ContentAdminRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  excerpt?: string | null;
  body?: string | null;
  authorName?: string | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  editorialNotes?: string | null;
  reviewNotes?: string | null;
  submittedForReviewAt?: string | null;
  reviewedAt?: string | null;
  updatedAt: string;
};

type ContentPostsPanelClientProps = {
  items: ContentAdminRow[];
  wellnessChrome?: boolean;
};

const CONTENT_TYPES = ["EVENT", "BLOG", "NEWS", "UPDATE", "KNOWLEDGE_ARTICLE"] as const;
const CONTENT_STATUS = ["DRAFT", "IN_REVIEW", "REJECTED", "PUBLISHED", "HIDDEN"] as const;
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
  const [authorName, setAuthorName] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [editorialNotes, setEditorialNotes] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | (typeof CONTENT_TYPES)[number]>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | (typeof CONTENT_STATUS)[number]>(
    "ALL",
  );
  const filteredItems = items.filter((item) => {
    if (typeFilter !== "ALL" && item.type !== typeFilter) {
      return false;
    }
    if (statusFilter !== "ALL" && item.status !== statusFilter) {
      return false;
    }
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return true;
    }
    const haystack = `${item.title} ${item.slug} ${item.type} ${item.status}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

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

  function parseTags(input: string): string[] {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index);
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
                authorName: authorName || undefined,
                tags: parseTags(tagsCsv),
                seoTitle: seoTitle || undefined,
                seoDescription: seoDescription || undefined,
                editorialNotes: editorialNotes || undefined,
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
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder="Author name"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder="Tags (comma separated)"
          value={tagsCsv}
          onChange={(event) => setTagsCsv(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder="SEO title"
          value={seoTitle}
          onChange={(event) => setSeoTitle(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs sm:col-span-6"
          placeholder="SEO description"
          value={seoDescription}
          onChange={(event) => setSeoDescription(event.target.value)}
        />
        <textarea
          className="app-input min-h-16 text-xs sm:col-span-6"
          placeholder="Editorial notes"
          value={editorialNotes}
          onChange={(event) => setEditorialNotes(event.target.value)}
        />
      </form>

      <div className="grid gap-2 sm:grid-cols-4">
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder="Search posts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="app-input h-9 text-xs"
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as "ALL" | (typeof CONTENT_TYPES)[number])
          }
        >
          <option value="ALL">All types</option>
          {CONTENT_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          className="app-input h-9 text-xs"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "ALL" | (typeof CONTENT_STATUS)[number])
          }
        >
          <option value="ALL">All statuses</option>
          {CONTENT_STATUS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <ul className={wellnessChrome ? "mt-2 space-y-3" : "mt-6 space-y-2"}>
        {filteredItems.map((p) => (
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
                            authorName: p.authorName ?? undefined,
                            tags: p.tags ?? [],
                            seoTitle: p.seoTitle ?? undefined,
                            seoDescription: p.seoDescription ?? undefined,
                            editorialNotes: p.editorialNotes ?? undefined,
                            reviewNotes: p.reviewNotes ?? undefined,
                            }),
                          }),
                        "Visibility updated",
                      )
                    }
                  >
                    Toggle hide
                  </button>
                  {(p.status === "DRAFT" || p.status === "REJECTED" || p.status === "HIDDEN") ? (
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      disabled={busyId !== null}
                      onClick={() =>
                        void run(
                          `${p.id}-submit`,
                          () =>
                            apiFetch(`/content/admin/posts/${p.id}/submit-review`, {
                              method: "POST",
                            }),
                          "Submitted for review",
                        )
                      }
                    >
                      Submit review
                    </button>
                  ) : null}
                  {p.status === "IN_REVIEW" ? (
                    <>
                      <button
                        type="button"
                        className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        disabled={busyId !== null}
                        onClick={() =>
                          void run(
                            `${p.id}-approve`,
                            () =>
                              apiFetch(`/content/admin/posts/${p.id}/review`, {
                                method: "POST",
                                body: JSON.stringify({ decision: "APPROVE" }),
                              }),
                            "Post approved",
                          )
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                        disabled={busyId !== null}
                        onClick={() => {
                          const note = window.prompt("Rejection note");
                          if (!note || note.trim().length === 0) {
                            return;
                          }
                          void run(
                            `${p.id}-reject`,
                            () =>
                              apiFetch(`/content/admin/posts/${p.id}/review`, {
                                method: "POST",
                                body: JSON.stringify({ decision: "REJECT", note }),
                              }),
                            "Post rejected",
                          );
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
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
                /{p.slug} · {formatDateTimeForUi(p.updatedAt)}
              </p>
              {p.tags && p.tags.length > 0 ? (
                <p className={wellnessChrome ? "text-xs text-sage-500" : "text-xs text-zinc-500"}>
                  tags: {p.tags.join(", ")}
                </p>
              ) : null}
              {p.reviewNotes ? (
                <p className={wellnessChrome ? "text-xs text-sage-500" : "text-xs text-zinc-500"}>
                  review: {p.reviewNotes}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {message ? <p className="text-xs text-sage-700">{message}</p> : null}
    </div>
  );
}
