import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { serverApiJson } from "@/lib/server-api";
import { ContentPostsPanelClient } from "@/components/admin/content-posts-panel-client";

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

async function loadContentPanelLabels(locale: string) {
  const t = await getTranslations({ locale, namespace: "contentAdminPages.content" });
  return {
    errorAuth: t("errorAuth"),
    errorLoad: t("errorLoad"),
    placeholders: {
      title: t("placeholders.title"),
      slug: t("placeholders.slug"),
      body: t("placeholders.body"),
      authorName: t("placeholders.authorName"),
      tagsCsv: t("placeholders.tagsCsv"),
      seoTitle: t("placeholders.seoTitle"),
      seoDescription: t("placeholders.seoDescription"),
      editorialNotes: t("placeholders.editorialNotes"),
      searchPosts: t("placeholders.searchPosts"),
    },
    labels: {
      type: t("labels.type"),
      status: t("labels.status"),
      allTypes: t("labels.allTypes"),
      allStatuses: t("labels.allStatuses"),
      create: t("labels.create"),
      toggleHide: t("labels.toggleHide"),
      submitReview: t("labels.submitReview"),
      approve: t("labels.approve"),
      reject: t("labels.reject"),
      delete: t("labels.delete"),
      tags: t("labels.tags"),
      review: t("labels.review"),
    },
    feedback: {
      actionFailed: t("feedback.actionFailed"),
      postCreated: t("feedback.postCreated"),
      visibilityUpdated: t("feedback.visibilityUpdated"),
      submittedForReview: t("feedback.submittedForReview"),
      postApproved: t("feedback.postApproved"),
      postRejected: t("feedback.postRejected"),
      postDeleted: t("feedback.postDeleted"),
      rejectionNotePrompt: t("feedback.rejectionNotePrompt"),
    },
  };
}

export async function ContentPostsPanel() {
  const locale = await getLocale();
  const labels = await loadContentPanelLabels(locale);
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
    return <div className="app-alert-warn max-w-xl">{message}</div>;
  }

  return <ContentPostsPanelClient items={res.data} labels={labels} />;
}
