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
};

function CoachDetailsModal({ coach, onClose }: CoachDetailsModalProps) {
  const t = useTranslations("marketing");
  const titleId = useId();
  const descriptionId = useId();
  const displayName = coachDisplayName(coach);

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
        className="relative z-10 mt-auto w-full max-w-[min(920px,95vw)] overflow-hidden rounded-t-[28px] border border-white/60 bg-white/90 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px]"
      >
        <div className="flex items-center justify-between border-b border-sand-200/70 px-5 py-4 sm:px-6">
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

        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-[18rem] bg-gradient-to-br from-mint-100/90 to-sand-100">
            {coach.user.avatarUrl ? (
              <Image
                src={coach.user.avatarUrl}
                alt={displayName}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[18rem] items-center justify-center text-5xl font-semibold text-sage-700">
                {coachInitials(coach.user.name, coach.user.email)}
              </div>
            )}
          </div>

          <div id={descriptionId} className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
            {coach.specialization ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sage-500">
                  {t("coachesModalSpecializationLabel")}
                </p>
                <p className="mt-1 text-base font-semibold text-sand-800">{coach.specialization}</p>
              </div>
            ) : null}

            {coach.experienceYears != null && coach.experienceYears > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sage-500">
                  {t("coachesModalExperienceLabel")}
                </p>
                <p className="mt-1 text-base text-sage-700">
                  {t("coachesExperience", { years: coach.experienceYears })}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sage-500">
                {t("coachesModalBioLabel")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-sage-600">
                {coach.bio?.trim() || t("coachesModalBioFallback")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function MarketingPublicCoachesGrid({ coaches }: MarketingPublicCoachesGridProps) {
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);

  const selectedCoach = useMemo(
    () => coaches.find((coach) => coach.id === selectedCoachId) ?? null,
    [coaches, selectedCoachId],
  );

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
      {selectedCoach ? <CoachDetailsModal coach={selectedCoach} onClose={() => setSelectedCoachId(null)} /> : null}
    </>
  );
}
