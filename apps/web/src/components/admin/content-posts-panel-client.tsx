"use client";

import { useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { adminChrome } from "@/components/admin/admin-chrome";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

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
  labels: {
    placeholders: {
      title: string;
      slug: string;
      body: string;
      authorName: string;
      tagsCsv: string;
      seoTitle: string;
      seoDescription: string;
      editorialNotes: string;
      searchPosts: string;
    };
    labels: {
      type: string;
      status: string;
      allTypes: string;
      allStatuses: string;
      create: string;
      toggleHide: string;
      submitReview: string;
      approve: string;
      reject: string;
      delete: string;
      tags: string;
      review: string;
      resetFilters: string;
    };
    feedback: {
      actionFailed: string;
      postCreated: string;
      visibilityUpdated: string;
      submittedForReview: string;
      postApproved: string;
      postRejected: string;
      postDeleted: string;
      rejectionNotePrompt: string;
    };
  };
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
  labels,
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

  const filterFields = useMemo(
    () => [
      {
        key: "type",
        label: labels.labels.type,
        emptyValue: "ALL",
        allLabel: labels.labels.allTypes,
        options: CONTENT_TYPES.map((value) => ({ value, label: value })),
      },
      {
        key: "status",
        label: labels.labels.status,
        emptyValue: "ALL",
        allLabel: labels.labels.allStatuses,
        options: CONTENT_STATUS.map((value) => ({ value, label: value })),
      },
    ],
    [labels.labels.allStatuses, labels.labels.allTypes, labels.labels.status, labels.labels.type],
  );

  const integratedFilterValues = useMemo(
    () => ({
      type: typeFilter,
      status: statusFilter,
    }),
    [statusFilter, typeFilter],
  );

  function handleIntegratedFilterChange(key: string, value: string): void {
    if (key === "type") {
      setTypeFilter(value as "ALL" | (typeof CONTENT_TYPES)[number]);
      return;
    }
    if (key === "status") {
      setStatusFilter(value as "ALL" | (typeof CONTENT_STATUS)[number]);
    }
  }

  function resetPostFilters(): void {
    setQuery("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  }

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
      setMessage(error instanceof ApiError ? error.message : labels.feedback.actionFailed);
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
            labels.feedback.postCreated,
          );
        }}
      >
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder={labels.placeholders.title}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs"
          placeholder={labels.placeholders.slug}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
        <DropdownSelect
          label={labels.labels.type}
          ariaLabel={labels.labels.type}
          name="type"
          value={type}
          options={TYPE_OPTIONS}
          onChange={setType}
          disabled={busyId !== null}
          required
          triggerClassName="ommm-dropdown-trigger--compact"
          menuClassName="text-xs"
        />
        <DropdownSelect
          label={labels.labels.status}
          ariaLabel={labels.labels.status}
          name="status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
          disabled={busyId !== null}
          required
          triggerClassName="ommm-dropdown-trigger--compact"
          menuClassName="text-xs"
        />
        <OmmButton type="submit" size="sm" variant="secondary" disabled={busyId !== null}>
          {labels.labels.create}
        </OmmButton>
        <textarea
          className="app-input min-h-20 text-xs sm:col-span-6"
          placeholder={labels.placeholders.body}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder={labels.placeholders.authorName}
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder={labels.placeholders.tagsCsv}
          value={tagsCsv}
          onChange={(event) => setTagsCsv(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs sm:col-span-2"
          placeholder={labels.placeholders.seoTitle}
          value={seoTitle}
          onChange={(event) => setSeoTitle(event.target.value)}
        />
        <input
          className="app-input h-9 text-xs sm:col-span-6"
          placeholder={labels.placeholders.seoDescription}
          value={seoDescription}
          onChange={(event) => setSeoDescription(event.target.value)}
        />
        <textarea
          className="app-input min-h-16 text-xs sm:col-span-6"
          placeholder={labels.placeholders.editorialNotes}
          value={editorialNotes}
          onChange={(event) => setEditorialNotes(event.target.value)}
        />
      </form>

      <ListPageSearchFilters
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder={labels.placeholders.searchPosts}
        fields={filterFields}
        filterValues={integratedFilterValues}
        onFilterChange={handleIntegratedFilterChange}
        onClearAll={resetPostFilters}
        resetLabel={labels.labels.resetFilters}
      />

      <ul className="mt-2 space-y-3">
        {filteredItems.map((p) => (
          <li key={p.id} className={adminChrome.panel}>
            <div className="w-full">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className={adminChrome.panelHeading}>{p.title}</p>
                  <p className={`mt-1 ${adminChrome.metaText}`}>
                    {p.type} · {p.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <OmmButton
                    type="button"
                    size="sm"
                    variant="ghost"
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
                        labels.feedback.visibilityUpdated,
                      )
                    }
                  >
                    {labels.labels.toggleHide}
                  </OmmButton>
                  {p.status === "DRAFT" || p.status === "REJECTED" || p.status === "HIDDEN" ? (
                    <OmmButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busyId !== null}
                      onClick={() =>
                        void run(
                          `${p.id}-submit`,
                          () =>
                            apiFetch(`/content/admin/posts/${p.id}/submit-review`, {
                              method: "POST",
                            }),
                          labels.feedback.submittedForReview,
                        )
                      }
                    >
                      {labels.labels.submitReview}
                    </OmmButton>
                  ) : null}
                  {p.status === "IN_REVIEW" ? (
                    <>
                      <OmmButton
                        type="button"
                        size="sm"
                        variant="primary"
                        disabled={busyId !== null}
                        onClick={() =>
                          void run(
                            `${p.id}-approve`,
                            () =>
                              apiFetch(`/content/admin/posts/${p.id}/review`, {
                                method: "POST",
                                body: JSON.stringify({ decision: "APPROVE" }),
                              }),
                            labels.feedback.postApproved,
                          )
                        }
                      >
                        {labels.labels.approve}
                      </OmmButton>
                      <OmmButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={busyId !== null}
                        onClick={() => {
                          const note = window.prompt(labels.feedback.rejectionNotePrompt);
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
                            labels.feedback.postRejected,
                          );
                        }}
                      >
                        {labels.labels.reject}
                      </OmmButton>
                    </>
                  ) : null}
                  <OmmButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busyId !== null}
                    onClick={() =>
                      void run(
                        p.id,
                        () =>
                          apiFetch(`/content/admin/posts/${p.id}`, {
                            method: "DELETE",
                          }),
                        labels.feedback.postDeleted,
                      )
                    }
                  >
                    {labels.labels.delete}
                  </OmmButton>
                </div>
              </div>
              <p className={`mt-2 ${adminChrome.metaText}`}>
                /{p.slug} · {formatDateTimeForUi(p.updatedAt)}
              </p>
              {p.tags && p.tags.length > 0 ? (
                <p className={adminChrome.metaText}>
                  {labels.labels.tags}: {p.tags.join(", ")}
                </p>
              ) : null}
              {p.reviewNotes ? (
                <p className={adminChrome.metaText}>
                  {labels.labels.review}: {p.reviewNotes}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {message ? <p className={adminChrome.metaText}>{message}</p> : null}
    </div>
  );
}
