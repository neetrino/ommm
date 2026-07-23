"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { adminChrome } from "@/components/admin/admin-chrome";
import { ContentPostDetailsSheet } from "@/components/shared/content/content-post-details-sheet";
import { ContentPostsList } from "@/components/shared/content/content-post-compact-row";
import {
  CONTENT_POST_STATUSES,
  CONTENT_POST_TYPES,
  type ContentPostRow,
} from "@/components/shared/content/content-post-types";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmButton } from "@/components/ui/omm-button";
import {
  adminContentCapabilities,
  type ContentCapabilities,
} from "@/lib/backoffice-capabilities";

type ContentPostsManagementProps = {
  items: ContentPostRow[];
  capabilities?: ContentCapabilities;
};

function AddPostGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ContentPostsManagement({ items, capabilities }: ContentPostsManagementProps) {
  const caps = capabilities ?? adminContentCapabilities();
  const t = useTranslations("contentAdminPages.content");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | (typeof CONTENT_POST_TYPES)[number]>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | (typeof CONTENT_POST_STATUSES)[number]
  >("ALL");
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | null>(null);
  const [selectedPost, setSelectedPost] = useState<ContentPostRow | null>(null);

  const filterFields = useMemo(
    () => [
      {
        key: "type",
        label: t("labels.type"),
        emptyValue: "ALL",
        allLabel: t("labels.allTypes"),
        options: CONTENT_POST_TYPES.map((value) => ({
          value,
          label: t(`typeValues.${value}`),
        })),
      },
      {
        key: "status",
        label: t("labels.status"),
        emptyValue: "ALL",
        allLabel: t("labels.allStatuses"),
        options: CONTENT_POST_STATUSES.map((value) => ({
          value,
          label: t(`statusValues.${value}`),
        })),
      },
    ],
    [t],
  );

  const integratedFilterValues = useMemo(
    () => ({
      type: typeFilter,
      status: statusFilter,
    }),
    [statusFilter, typeFilter],
  );

  const activeFilterCount = useMemo(
    () =>
      [query.trim(), typeFilter !== "ALL" ? typeFilter : "", statusFilter !== "ALL" ? statusFilter : ""]
        .filter(Boolean)
        .length,
    [query, statusFilter, typeFilter],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== "ALL" && item.type !== typeFilter) {
        return false;
      }
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }
      if (normalizedQuery.length === 0) {
        return true;
      }
      const haystack = `${item.title} ${item.slug} ${item.type} ${item.status}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, query, statusFilter, typeFilter]);

  function handleIntegratedFilterChange(key: string, value: string): void {
    if (key === "type") {
      setTypeFilter(value as typeof typeFilter);
      return;
    }
    if (key === "status") {
      setStatusFilter(value as typeof statusFilter);
    }
  }

  function resetFilters(): void {
    setQuery("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  }

  const openCreate = useCallback(() => {
    setSelectedPost(null);
    setSheetMode("create");
  }, []);

  const openPost = useCallback((post: ContentPostRow) => {
    setSelectedPost(post);
    setSheetMode("edit");
  }, []);

  const closeSheet = useCallback(() => {
    setSheetMode(null);
    setSelectedPost(null);
  }, []);

  const handleChanged = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        title={t("title")}
        search={
          <ListPageSearchFilters
            className="min-w-0 flex-1"
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder={t("placeholders.searchPosts")}
            fields={filterFields}
            filterValues={integratedFilterValues}
            onFilterChange={handleIntegratedFilterChange}
            onClearAll={resetFilters}
            resetLabel={t("labels.resetFilters")}
          />
        }
        trailing={
          <>
            {caps.canCreate ? (
              <OmmButton
                type="button"
                variant="secondary"
                size="md"
                onClick={openCreate}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
              >
                <AddPostGlyph className="h-5 w-5 shrink-0" />
                {t("createButton")}
              </OmmButton>
            ) : null}
            {activeFilterCount > 0 ? (
              <p className="whitespace-nowrap text-xs text-sage-500" role="status">
                {t("activeFilterCount", { count: activeFilterCount })}
              </p>
            ) : null}
          </>
        }
      />

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-sage-600">
          {t("empty")}
        </div>
      ) : (
        <ContentPostsList
          posts={filteredItems}
          busy={false}
          onSelect={openPost}
          onEdit={openPost}
        />
      )}

      {items.length > 0 ? (
        <p className={adminChrome.metaText}>
          {t("resultsCount", { shown: filteredItems.length, total: items.length })}
        </p>
      ) : null}

      <ContentPostDetailsSheet
        mode={sheetMode}
        post={selectedPost}
        onClose={closeSheet}
        onChanged={handleChanged}
        capabilities={caps}
      />
    </div>
  );
}
