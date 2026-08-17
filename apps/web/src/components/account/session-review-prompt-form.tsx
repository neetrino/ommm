"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchSessionReviewsRefresh } from "@/lib/session-reviews-events";
import styles from "@/components/account/required-phone-completion-gate.module.css";

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

type SessionReviewPromptFormProps = {
  reviewId: string;
  onClosed: () => void;
  onLater: () => void;
};

export function SessionReviewPromptForm({
  reviewId,
  onClosed,
  onLater,
}: SessionReviewPromptFormProps) {
  const t = useTranslations("sessionReviewPrompt");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canSubmit = rating !== null && comment.trim().length > 0;

  return (
    <>
      <SessionReviewPromptFields
        rating={rating}
        comment={comment}
        isAnonymous={isAnonymous}
        pending={pending}
        error={error}
        onRating={setRating}
        onComment={setComment}
        onAnonymous={setIsAnonymous}
      />
      <OmmButton
        type="button"
        variant="primary"
        size="md"
        className="w-full"
        disabled={pending || !canSubmit}
        onClick={() =>
          void submitReview({
            reviewId,
            rating,
            comment,
            isAnonymous,
            setError,
            setPending,
            onClosed,
            ratingRequired: t("ratingRequired"),
            commentRequired: t("commentRequired"),
            saveFailed: t("saveFailed"),
          })
        }
      >
        {pending ? t("saving") : t("submit")}
      </OmmButton>
      <OmmButton
        type="button"
        variant="secondary"
        size="md"
        className="w-full"
        disabled={pending}
        onClick={onLater}
      >
        {t("later")}
      </OmmButton>
      <button
        type="button"
        className="text-center text-xs text-sage-500 underline-offset-2 hover:underline"
        disabled={pending}
        onClick={() =>
          void dismissReview({
            reviewId,
            setError,
            setPending,
            onClosed,
            saveFailed: t("saveFailed"),
          })
        }
      >
        {t("dontAsk")}
      </button>
    </>
  );
}

async function submitReview(params: {
  reviewId: string;
  rating: number | null;
  comment: string;
  isAnonymous: boolean;
  setError: (value: string | null) => void;
  setPending: (value: boolean) => void;
  onClosed: () => void;
  ratingRequired: string;
  commentRequired: string;
  saveFailed: string;
}): Promise<void> {
  if (params.rating === null) {
    params.setError(params.ratingRequired);
    return;
  }
  const trimmedComment = params.comment.trim();
  if (trimmedComment.length === 0) {
    params.setError(params.commentRequired);
    return;
  }
  params.setPending(true);
  params.setError(null);
  try {
    await apiFetch(`/session-reviews/${encodeURIComponent(params.reviewId)}/submit`, {
      method: "POST",
      body: JSON.stringify({
        rating: params.rating,
        comment: trimmedComment,
        isAnonymous: params.isAnonymous,
      }),
    });
    dispatchSessionReviewsRefresh();
    params.onClosed();
  } catch (caught) {
    params.setError(caught instanceof ApiError ? caught.message : params.saveFailed);
  } finally {
    params.setPending(false);
  }
}

async function dismissReview(params: {
  reviewId: string;
  setError: (value: string | null) => void;
  setPending: (value: boolean) => void;
  onClosed: () => void;
  saveFailed: string;
}): Promise<void> {
  params.setPending(true);
  params.setError(null);
  try {
    await apiFetch(`/session-reviews/${encodeURIComponent(params.reviewId)}/dismiss`, {
      method: "POST",
    });
    dispatchSessionReviewsRefresh();
    params.onClosed();
  } catch (caught) {
    params.setError(caught instanceof ApiError ? caught.message : params.saveFailed);
  } finally {
    params.setPending(false);
  }
}

function SessionReviewPromptFields({
  rating,
  comment,
  isAnonymous,
  pending,
  error,
  onRating,
  onComment,
  onAnonymous,
}: {
  rating: number | null;
  comment: string;
  isAnonymous: boolean;
  pending: boolean;
  error: string | null;
  onRating: (value: number) => void;
  onComment: (value: string) => void;
  onAnonymous: (value: boolean) => void;
}) {
  const t = useTranslations("sessionReviewPrompt");
  return (
    <>
      <p className="text-sm text-sage-700">{t("ask")}</p>
      <div className="flex gap-2" role="group" aria-label={t("ratingAria")}>
        {RATING_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className={
              rating !== null && value <= rating
                ? "text-2xl text-amber-700"
                : "text-2xl text-sage-300"
            }
            aria-pressed={rating === value}
            onClick={() => onRating(value)}
            disabled={pending}
          >
            ★
          </button>
        ))}
      </div>
      <label className={styles.field}>
        <span className="ommm-label">{t("commentLabel")}</span>
        <textarea
          className="ommm-input min-h-24"
          value={comment}
          maxLength={2000}
          required
          disabled={pending}
          onChange={(event) => onComment(event.target.value)}
        />
      </label>
      <fieldset className="space-y-2" disabled={pending}>
        <legend className="ommm-label">{t("visibilityLabel")}</legend>
        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-sand-200/90 bg-white/70 px-3 py-2.5 text-sm text-sage-800">
          <input
            type="radio"
            name="session-review-visibility"
            className="mt-1"
            checked={!isAnonymous}
            onChange={() => onAnonymous(false)}
          />
          <span className="font-medium text-sage-900">{t("showNameOption")}</span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-sand-200/90 bg-white/70 px-3 py-2.5 text-sm text-sage-800">
          <input
            type="radio"
            name="session-review-visibility"
            className="mt-1"
            checked={isAnonymous}
            onChange={() => onAnonymous(true)}
          />
          <span className="font-medium text-sage-900">{t("anonymousOption")}</span>
        </label>
      </fieldset>
      {error ? <FormErrorBanner message={error} variant="inline" /> : null}
    </>
  );
}
