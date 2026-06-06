"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  contentPostStatusBadgeClass,
  contentPostTypeBadgeClass,
} from "@/components/shared/content/content-post-display-helpers";
import { ContentPostRowActions } from "@/components/shared/content/content-post-row-actions";
import { ContentPostUpdatedDatetime } from "@/components/shared/content/content-post-updated-datetime";
import {
  CONTENT_POSTS_LIST_ACTIONS_CELL,
  CONTENT_POSTS_LIST_CELL,
  CONTENT_POSTS_LIST_DATE_CELL,
  CONTENT_POSTS_LIST_EMPHASIZED_HEADER,
  CONTENT_POSTS_LIST_HEADER_CLASS,
  CONTENT_POSTS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  CONTENT_POSTS_LIST_ROW_CLASS,
  CONTENT_POSTS_LIST_SPACER_CELL,
  CONTENT_POSTS_LIST_TABLE_CLASS,
  CONTENT_POSTS_LIST_ACTIONS_HEADER_CELL,
} from "@/components/shared/content/content-posts-list-layout";
import type { ContentPostRow } from "@/components/shared/content/content-post-types";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ContentPostListCoverThumb } from "@/components/shared/content/content-post-list-cover-thumb";

type ContentPostCompactRowProps = {
  post: ContentPostRow;
  busy: boolean;
  onSelect: (post: ContentPostRow) => void;
  onEdit: (post: ContentPostRow) => void;
};

export function ContentPostCompactRow({
  post,
  busy,
  onSelect,
  onEdit,
}: ContentPostCompactRowProps) {
  const t = useTranslations("contentAdminPages.content");
  const locale = useLocale();

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("openPostAria", { title: post.title })}
      onClick={() => onSelect(post)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(post);
        }
      }}
      className={CONTENT_POSTS_LIST_ROW_CLASS}
    >
      <div className={`${CONTENT_POSTS_LIST_CELL} md:flex md:justify-center`}>
        <AdminListMobileLabel label={t("colCover")} />
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/60 bg-sage-50">
          <ContentPostListCoverThumb coverImageUrl={post.coverImageUrl} title={post.title} />
        </div>
      </div>

      <div className={CONTENT_POSTS_LIST_CELL}>
        <AdminListMobileLabel label={t("colTitle")} />
        <button
          type="button"
          className="block max-w-full truncate text-left text-sm font-medium text-sage-900 underline-offset-2 hover:underline"
          title={post.title}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(post);
          }}
        >
          {post.title}
        </button>
      </div>

      <div className={`${CONTENT_POSTS_LIST_CELL} md:flex md:justify-center`}>
        <AdminListMobileLabel label={t("colType")} />
        <span className={contentPostTypeBadgeClass(post.type)}>
          {t(`typeValues.${post.type}`)}
        </span>
      </div>

      <div className={`${CONTENT_POSTS_LIST_CELL} md:flex md:justify-center`}>
        <AdminListMobileLabel label={t("colStatus")} />
        <span className={contentPostStatusBadgeClass(post.status)}>
          {t(`statusValues.${post.status}`)}
        </span>
      </div>

      <div className={CONTENT_POSTS_LIST_DATE_CELL}>
        <AdminListMobileLabel label={t("colUpdated")} />
        <ContentPostUpdatedDatetime locale={locale} updatedAt={post.updatedAt} />
      </div>

      <div className={CONTENT_POSTS_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={`${CONTENT_POSTS_LIST_ACTIONS_CELL} ${CONTENT_POSTS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
      >
        <ContentPostRowActions busy={busy} onEdit={() => onEdit(post)} />
      </div>
    </article>
  );
}

type ContentPostsListProps = {
  posts: readonly ContentPostRow[];
  busy: boolean;
  onSelect: (post: ContentPostRow) => void;
  onEdit: (post: ContentPostRow) => void;
};

export function ContentPostsList({ posts, busy, onSelect, onEdit }: ContentPostsListProps) {
  const t = useTranslations("contentAdminPages.content");

  return (
    <div className={CONTENT_POSTS_LIST_TABLE_CLASS}>
      <div className={CONTENT_POSTS_LIST_HEADER_CLASS}>
        <span className={`${CONTENT_POSTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colCover")}
        </span>
        <span>{t("colTitle")}</span>
        <span className={`${CONTENT_POSTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colType")}
        </span>
        <span className={`${CONTENT_POSTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colStatus")}
        </span>
        <span className={`${CONTENT_POSTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colUpdated")}
        </span>
        <span aria-hidden="true" />
        <span className={CONTENT_POSTS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
      </div>
      {posts.map((post) => (
        <ContentPostCompactRow
          key={post.id}
          post={post}
          busy={busy}
          onSelect={onSelect}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
