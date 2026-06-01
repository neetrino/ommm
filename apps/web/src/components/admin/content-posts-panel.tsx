import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { serverApiJson } from "@/lib/server-api";
import { ContentPostsPanelClient } from "@/components/admin/content-posts-panel-client";
import { AccountPageFrame } from "@/components/layout/account-page-frame";

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

type ContentPostsPanelProps = {
  /** When true (admin workspace), match member dashboard glass surfaces. */
  wellnessChrome?: boolean;
};

function getContentPanelLabels(locale: string) {
  if (locale === "hy") {
    return {
      errorAuth: "Պահանջվում է ադմինի կամ բովանդակության դեր։",
      errorLoad: "Չհաջողվեց բեռնել գրառումները ({status})։",
      title: "Բովանդակություն",
      description: "Կառավարեք գրառումները և տեսանելիության կարգավիճակները։",
      placeholders: {
        title: "Վերնագիր",
        slug: "Slug",
        body: "Բովանդակություն",
        authorName: "Հեղինակի անուն",
        tagsCsv: "Թեգեր (ստորակետով)",
        seoTitle: "SEO վերնագիր",
        seoDescription: "SEO նկարագրություն",
        editorialNotes: "Խմբագրական նշումներ",
        searchPosts: "Որոնել գրառումներ",
      },
      labels: {
        type: "Տեսակ",
        status: "Կարգավիճակ",
        allTypes: "Բոլոր տեսակները",
        allStatuses: "Բոլոր կարգավիճակները",
        create: "Ստեղծել",
        toggleHide: "Փոխել տեսանելիությունը",
        submitReview: "Ուղարկել վերանայման",
        approve: "Հաստատել",
        reject: "Մերժել",
        delete: "Ջնջել",
        tags: "թեգեր",
        review: "վերանայում",
      },
      feedback: {
        actionFailed: "Գործողությունը չհաջողվեց",
        postCreated: "Գրառումը ստեղծված է",
        visibilityUpdated: "Տեսանելիությունը թարմացվել է",
        submittedForReview: "Ուղարկվեց վերանայման",
        postApproved: "Գրառումը հաստատվեց",
        postRejected: "Գրառումը մերժվեց",
        postDeleted: "Գրառումը ջնջվեց",
        rejectionNotePrompt: "Մերժման նշում",
      },
    };
  }
  if (locale === "ru") {
    return {
      errorAuth: "Нужна роль админа или контента.",
      errorLoad: "Не удалось загрузить посты ({status}).",
      title: "Контент",
      description: "Управляйте постами и статусами видимости.",
      placeholders: {
        title: "Заголовок",
        slug: "Slug",
        body: "Контент",
        authorName: "Имя автора",
        tagsCsv: "Теги (через запятую)",
        seoTitle: "SEO заголовок",
        seoDescription: "SEO описание",
        editorialNotes: "Редакционные заметки",
        searchPosts: "Поиск постов",
      },
      labels: {
        type: "Тип",
        status: "Статус",
        allTypes: "Все типы",
        allStatuses: "Все статусы",
        create: "Создать",
        toggleHide: "Переключить видимость",
        submitReview: "Отправить на ревью",
        approve: "Одобрить",
        reject: "Отклонить",
        delete: "Удалить",
        tags: "теги",
        review: "ревью",
      },
      feedback: {
        actionFailed: "Действие не выполнено",
        postCreated: "Пост создан",
        visibilityUpdated: "Видимость обновлена",
        submittedForReview: "Отправлено на ревью",
        postApproved: "Пост одобрен",
        postRejected: "Пост отклонён",
        postDeleted: "Пост удалён",
        rejectionNotePrompt: "Комментарий к отклонению",
      },
    };
  }
  return {
    errorAuth: "Admin or content role required.",
    errorLoad: "Could not load posts ({status}).",
    title: "Content",
    description: "Manage posts and visibility states.",
    placeholders: {
      title: "Title",
      slug: "Slug",
      body: "Body",
      authorName: "Author name",
      tagsCsv: "Tags (comma separated)",
      seoTitle: "SEO title",
      seoDescription: "SEO description",
      editorialNotes: "Editorial notes",
      searchPosts: "Search posts",
    },
    labels: {
      type: "Type",
      status: "Status",
      allTypes: "All types",
      allStatuses: "All statuses",
      create: "Create",
      toggleHide: "Toggle hide",
      submitReview: "Submit review",
      approve: "Approve",
      reject: "Reject",
      delete: "Delete",
      tags: "tags",
      review: "review",
    },
    feedback: {
      actionFailed: "Action failed",
      postCreated: "Post created",
      visibilityUpdated: "Visibility updated",
      submittedForReview: "Submitted for review",
      postApproved: "Post approved",
      postRejected: "Post rejected",
      postDeleted: "Post deleted",
      rejectionNotePrompt: "Rejection note",
    },
  };
}

export async function ContentPostsPanel({
  wellnessChrome = false,
}: ContentPostsPanelProps) {
  const locale = await getLocale();
  const labels = getContentPanelLabels(locale);
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<ContentAdminRow[]>(
    "/content/admin/posts",
    cookie,
  );

  if (!res.ok) {
    const message =
      res.status === 401 || res.status === 403
        ? labels.errorAuth
        : labels.errorLoad.replace("{status}", String(res.status));
    return wellnessChrome ? (
      <div className="app-alert-warn max-w-xl">{message}</div>
    ) : (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {message}
      </div>
    );
  }

  const list = (
    <ContentPostsPanelClient
      items={res.data}
      wellnessChrome={wellnessChrome}
      labels={labels}
    />
  );

  if (wellnessChrome) {
    return (
      <AccountPageFrame title={labels.title} description={labels.description}>
        {list}
      </AccountPageFrame>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{labels.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{labels.description}</p>
      {list}
    </div>
  );
}
