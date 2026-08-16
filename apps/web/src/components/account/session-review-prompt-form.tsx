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
        disabled={pending}
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
  saveFailed: string;
}): Promise<void> {
  if (params.rating === null) {
    params.setError(params.ratingRequired);
    return;
  }
  params.setPending(true);
  params.setError(null);
  try {
    await apiFetch(`/session-reviews/${encodeURIComponent(params.reviewId)}/submit`, {
      method: "POST",
      body: JSON.stringify({
        rating: params.rating,
        comment: params.comment.trim() || undefined,
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
          disabled={pending}
          onChange={(event) => onComment(event.target.value)}
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-sage-800">
        <input
          type="checkbox"
          className="mt-1"
          checked={isAnonymous}
          disabled={pending}
          onChange={(event) => onAnonymous(event.target.checked)}
        />
        <span>{t("anonymousHint")}</span>
      </label>
      {error ? <FormErrorBanner message={error} variant="inline" /> : null}
    </>
  );
}
