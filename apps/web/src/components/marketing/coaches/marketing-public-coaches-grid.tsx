"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  coachCardDisplayName,
  coachCardInitials,
  type CoachCardData,
} from "@/components/coaches/coach-card-display";
import { PublicCoachCard } from "@/components/coaches/public-coach-card";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

type PublicCoach = CoachCardData;

type MarketingPublicCoachesGridProps = {
  coaches: PublicCoach[];
};

function coachEntranceDirection(index: number, compactViewport: boolean): -1 | 1 {
  if (compactViewport) {
    return index % 2 === 0 ? -1 : 1;
  }
  if (index < 2) {
    return -1;
  }
  if (index < 4) {
    return 1;
  }
  return Math.floor(index / 2) % 2 === 0 ? -1 : 1;
}

type CoachCardProps = {
  coach: PublicCoach;
  index: number;
  compactViewport: boolean;
  reduceMotion: boolean;
  onClick: () => void;
};

function CoachCard({ coach, index, compactViewport, reduceMotion, onClick }: CoachCardProps) {
  const t = useTranslations("marketing");
  const direction = coachEntranceDirection(index, compactViewport);
  const translateDistance = compactViewport ? 28 : 56;
  const delaySeconds = Math.min(index, 7) * 0.1;
  const displayName = coachCardDisplayName(coach.user);
  const experienceText =
    coach.experienceYears != null && coach.experienceYears > 0
      ? t("coachesExperience", { years: coach.experienceYears })
      : null;

  const initialState = reduceMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        x: direction * translateDistance,
        scale: 0.965,
        filter: "blur(10px)",
      };

  const visibleState = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" };

  const transition = reduceMotion
    ? { duration: 0.2, ease: "easeOut" as const }
    : {
        duration: 0.82,
        delay: delaySeconds,
        ease: [0.22, 1, 0.36, 1] as const,
      };

  return (
    <motion.li
      className="list-none"
      initial={initialState}
      whileInView={visibleState}
      viewport={{ once: true, amount: 0.24 }}
      transition={transition}
      style={{ willChange: "transform, opacity, filter" }}
    >
      <PublicCoachCard
        user={coach.user}
        specialization={coach.specialization}
        experienceText={experienceText}
        bio={coach.bio}
        imageIndex={index}
        onClick={onClick}
        clickAriaLabel={t("coachesOpenCardAria", { name: displayName })}
      />
    </motion.li>
  );
}

type CoachDetailsModalProps = {
  coach: PublicCoach;
  onClose: () => void;
  isImagePreviewOpen: boolean;
  onOpenImagePreview: () => void;
  onCloseImagePreview: () => void;
};

function CoachDetailsModal({
  coach,
  onClose,
  isImagePreviewOpen,
  onOpenImagePreview,
  onCloseImagePreview,
}: CoachDetailsModalProps) {
  const t = useTranslations("marketing");
  const titleId = useId();
  const descriptionId = useId();
  const displayName = coachCardDisplayName(coach.user);
  const showExperience = coach.experienceYears != null && coach.experienceYears > 0;
  const showSpecialization = coach.specialization !== null && coach.specialization.trim() !== "";
  const bio = coach.bio?.trim() || t("coachesModalBioFallback");

  useEffect(() => {
    if (!isImagePreviewOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseImagePreview();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isImagePreviewOpen, onCloseImagePreview]);

  return (
    <div className="ommm-modal-overlay z-50" role="presentation">
      <button
        type="button"
        className="ommm-modal-backdrop"
        aria-label={t("coachesModalBackdropClose")}
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 mt-auto min-h-[70vh] max-h-[min(95vh,900px)] w-full max-w-[min(980px,96vw)] overflow-y-auto rounded-t-[28px] border border-white/70 bg-gradient-to-br from-white via-[#fffef9] to-[#f7f2e8] shadow-[0_34px_90px_-36px_rgba(45,40,35,0.42)] backdrop-blur-md sm:mt-0 sm:min-h-[42rem] sm:rounded-[24px]"
      >
        <div className="flex items-center justify-between border-b border-sand-200/70 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
              {t("coachesModalProfileLabel")}
            </p>
            <h3 id={titleId} className="ommm-h3 mt-1 text-sage-900">
              {displayName}
            </h3>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            aria-label={t("coachesModalCloseAria")}
            onClick={onClose}
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div id={descriptionId} className="space-y-7 p-5 sm:p-7">
          <div className="grid gap-5 md:grid-cols-[14rem_minmax(0,1fr)]">
            <button
              type="button"
              onClick={() => {
                if (coach.user.avatarUrl) {
                  onOpenImagePreview();
                }
              }}
              className="group relative h-56 cursor-zoom-in overflow-hidden rounded-2xl border border-sand-200/80 bg-gradient-to-br from-mint-100/90 to-sand-100 shadow-[0_18px_40px_-26px_rgba(45,40,35,0.5)] transition-transform duration-200 hover:scale-[1.01] md:h-[17rem]"
              aria-label={`Open ${displayName} photo preview`}
            >
              {coach.user.avatarUrl ? (
                <Image
                  src={coach.user.avatarUrl}
                  alt={displayName}
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  {...aboveFoldImageProps()}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl font-semibold text-sage-700">
                  {coachCardInitials(coach.user)}
                </div>
              )}
            </button>

            <div className="flex min-w-0 flex-col justify-start rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
              <h4 className="text-2xl font-semibold text-sage-900">{displayName}</h4>
              <p className="mt-1 truncate text-sm text-sage-500">{coach.user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {showSpecialization ? (
                  <span className="inline-flex rounded-full border border-sand-300/80 bg-sand-50 px-3 py-1 text-xs font-semibold text-sand-800">
                    {coach.specialization}
                  </span>
                ) : null}
                {showExperience ? (
                  <span className="inline-flex rounded-full border border-mint-300/80 bg-mint-50 px-3 py-1 text-xs font-semibold text-sage-800">
                    {t("coachesExperience", { years: coach.experienceYears ?? 0 })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-base font-semibold text-sage-900">{t("coachesModalBasicInfoLabel")}</h5>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {showSpecialization ? (
                <div className="rounded-xl border border-sand-200/80 bg-white/85 p-4 shadow-[0_10px_30px_-24px_rgba(45,40,35,0.6)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sage-500">
                    {t("coachesModalSpecializationLabel")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-sage-800">{coach.specialization}</p>
                </div>
              ) : null}
              {showExperience ? (
                <div className="rounded-xl border border-sand-200/80 bg-white/85 p-4 shadow-[0_10px_30px_-24px_rgba(45,40,35,0.6)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sage-500">
                    {t("coachesModalExperienceLabel")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-sage-800">
                    {t("coachesExperience", { years: coach.experienceYears ?? 0 })}
                  </p>
                </div>
              ) : null}
              <div className="rounded-xl border border-sand-200/80 bg-white/90 p-4 shadow-[0_14px_36px_-30px_rgba(45,40,35,0.65)] sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sage-500">
                  {t("coachesModalBioLabel")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-sage-600 sm:text-[0.95rem]">{bio}</p>
              </div>
            </div>
          </div>
        </div>

      </section>
      {isImagePreviewOpen && coach.user.avatarUrl ? (
        <div className="ommm-modal-overlay z-[80] items-center p-3 sm:p-6" role="presentation">
          <button
            type="button"
            className="ommm-modal-backdrop"
            aria-label="Close photo preview"
            onClick={onCloseImagePreview}
          />
          <div className="pointer-events-none relative z-10 h-[92vh] w-[96vw]">
            <Image
              src={coach.user.avatarUrl}
              alt={displayName}
              fill
              sizes="96vw"
              className="object-contain drop-shadow-[0_28px_80px_rgba(0,0,0,0.65)]"
              {...aboveFoldImageProps()}
            />
          </div>
          <button
            type="button"
            onClick={onCloseImagePreview}
            aria-label="Close photo preview"
            className="absolute right-5 top-5 z-20 rounded-full border border-white/45 bg-black/45 p-2 text-2xl leading-none text-white transition hover:scale-105 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MarketingPublicCoachesGrid({ coaches }: MarketingPublicCoachesGridProps) {
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const queryCoachId = new URL(window.location.href).searchParams.get("coach");
    if (!queryCoachId) {
      return null;
    }
    return coaches.some((coach) => coach.id === queryCoachId) ? queryCoachId : null;
  });
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return new URL(window.location.href).searchParams.get("photo") === "1";
  });
  const [compactViewport, setCompactViewport] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;

  const openImagePreview = () => {
    setIsImagePreviewOpen(true);
  };

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false);
  };

  const selectedCoach = useMemo(
    () => coaches.find((coach) => coach.id === selectedCoachId) ?? null,
    [coaches, selectedCoachId],
  );
  const canShowImagePreview = isImagePreviewOpen && selectedCoach?.user.avatarUrl != null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    if (selectedCoachId) {
      url.searchParams.set("coach", selectedCoachId);
    } else {
      url.searchParams.delete("coach");
    }
    if (selectedCoachId && canShowImagePreview) {
      url.searchParams.set("photo", "1");
    } else {
      url.searchParams.delete("photo");
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [canShowImagePreview, selectedCoachId]);

  useEffect(() => {
    if (selectedCoach === null) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCoach]);

  useEffect(() => {
    if (selectedCoach === null) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCoachId(null);
        setIsImagePreviewOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCoach]);

  useEffect(() => {
    const viewportMediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => {
      setCompactViewport(viewportMediaQuery.matches);
    };
    syncViewport();
    viewportMediaQuery.addEventListener("change", syncViewport);
    return () => {
      viewportMediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  return (
    <>
      <ul className="mt-12 grid grid-cols-1 gap-6 overflow-x-clip md:grid-cols-2 lg:grid-cols-4">
        {coaches.map((coach, index) => (
          <CoachCard
            key={coach.id}
            coach={coach}
            index={index}
            compactViewport={compactViewport}
            reduceMotion={reduceMotion}
            onClick={() => {
              setSelectedCoachId(coach.id);
            }}
          />
        ))}
      </ul>
      {selectedCoach ? (
        <CoachDetailsModal
          coach={selectedCoach}
          onClose={() => {
            setSelectedCoachId(null);
            setIsImagePreviewOpen(false);
          }}
          isImagePreviewOpen={canShowImagePreview}
          onOpenImagePreview={openImagePreview}
          onCloseImagePreview={closeImagePreview}
        />
      ) : null}
    </>
  );
}
