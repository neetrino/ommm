"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type PublicCoach = {
  id: string;
  bio: string | null;
  specialization: string | null;
  experienceYears: number | null;
  user: { name: string | null; email: string; avatarUrl: string | null };
};

type MarketingPublicCoachesGridProps = {
  coaches: PublicCoach[];
};

function coachDisplayName(coach: PublicCoach): string {
  return coach.user.name?.trim() || coach.user.email;
}

function coachInitials(name: string | null, email: string): string {
  const trimmedName = name?.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    const firstInitial = parts[0]?.[0] ?? "";
    const secondInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    const compactInitials = `${firstInitial}${secondInitial}`.toUpperCase();
    if (compactInitials !== "") {
      return compactInitials;
    }
  }
  return email[0]?.toUpperCase() ?? "?";
}

type CoachCardProps = {
  coach: PublicCoach;
  onClick: () => void;
};

function CoachCard({ coach, onClick }: CoachCardProps) {
  const t = useTranslations("marketing");

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onClick}
        className="ommm-card ommm-marketing-card-hover group flex min-h-[28rem] w-full cursor-pointer flex-col gap-6 p-6 text-left shadow-[0_24px_55px_-26px_rgba(45,40,35,0.24)] transition-transform duration-200 hover:-translate-y-1 sm:p-7"
        aria-label={t("coachesOpenCardAria", { name: coachDisplayName(coach) })}
      >
        <div
          className="relative h-56 w-full shrink-0 overflow-hidden rounded-[24px] bg-gradient-to-br from-mint-100/90 to-sand-100 ring-1 ring-white/70"
          aria-hidden
        >
          {coach.user.avatarUrl ? (
            <Image
              src={coach.user.avatarUrl}
              alt=""
              fill
              sizes="(min-width:1024px) 22vw, (min-width:768px) 45vw, 92vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-sage-700">
              {coachInitials(coach.user.name, coach.user.email)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="ommm-h3 text-sage-800 sm:text-[1.4rem]">{coachDisplayName(coach)}</h2>
          {coach.specialization ? (
            <p className="mt-2 text-sm font-medium text-sand-700">{coach.specialization}</p>
          ) : null}
          {coach.experienceYears != null && coach.experienceYears > 0 ? (
            <p className="mt-3 text-sm text-sage-500">
              {t("coachesExperience", { years: coach.experienceYears })}
            </p>
          ) : null}
          {coach.bio ? (
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-sage-500">{coach.bio}</p>
          ) : null}
        </div>
      </button>
    </li>
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
  const displayName = coachDisplayName(coach);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-sage-950/45 backdrop-blur-[2px]"
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
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl font-semibold text-sage-700">
                  {coachInitials(coach.user.name, coach.user.email)}
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
                    {t("coachesExperience", { years: coach.experienceYears })}
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
                    {t("coachesExperience", { years: coach.experienceYears })}
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-sage-950/75 p-3 backdrop-blur-[6px] sm:p-6">
          <button
            type="button"
            className="absolute inset-0"
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
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    const queryCoachId = url.searchParams.get("coach");
    const shouldOpenPhoto = url.searchParams.get("photo") === "1";
    if (!queryCoachId) {
      return;
    }
    const coachExists = coaches.some((coach) => coach.id === queryCoachId);
    if (!coachExists) {
      return;
    }
    setSelectedCoachId(queryCoachId);
    setIsImagePreviewOpen(shouldOpenPhoto);
  }, [coaches]);

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
    if (selectedCoachId && isImagePreviewOpen) {
      url.searchParams.set("photo", "1");
    } else {
      url.searchParams.delete("photo");
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [isImagePreviewOpen, selectedCoachId]);

  useEffect(() => {
    if (selectedCoachId === null && isImagePreviewOpen) {
      setIsImagePreviewOpen(false);
    }
  }, [isImagePreviewOpen, selectedCoachId]);

  useEffect(() => {
    if (selectedCoach?.user.avatarUrl || !isImagePreviewOpen) {
      return;
    }
    setIsImagePreviewOpen(false);
  }, [isImagePreviewOpen, selectedCoach]);

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
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCoach]);

  return (
    <>
      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} onClick={() => setSelectedCoachId(coach.id)} />
        ))}
      </ul>
      {selectedCoach ? (
        <CoachDetailsModal
          coach={selectedCoach}
          onClose={() => setSelectedCoachId(null)}
          isImagePreviewOpen={isImagePreviewOpen}
          onOpenImagePreview={openImagePreview}
          onCloseImagePreview={closeImagePreview}
        />
      ) : null}
    </>
  );
}
