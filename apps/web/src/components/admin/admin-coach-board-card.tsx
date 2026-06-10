"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { AdminCoachRowActions } from "@/components/admin/admin-coach-row-actions";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import {
  coachCardDisplayName,
  coachCardInitials,
} from "@/components/coaches/coach-card-display";
import { COACHES_PAGE_CARD } from "@/components/marketing/coaches/coaches-page-tokens";
import coachCardStyles from "@/components/marketing/coaches/coaches-page-coach-card.module.css";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { OmmButton } from "@/components/ui/omm-button";
import { firstRowGridImageProps } from "@/lib/image-loading-props";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminCoachBoardCardProps = {
  coach: AdminCoachDirectoryRow;
  imageIndex: number;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
  onSelect: (coach: AdminCoachDirectoryRow) => void;
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("adminPages.coaches");
  const className = isActive
    ? "border-mint-200 bg-mint-50 text-sage-900"
    : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${className}`}>
      {isActive ? t("filters.statusActive") : t("filters.statusInactive")}
    </span>
  );
}

function cardInsetPercent(valuePx: number, basePx: number): string {
  return `${(valuePx / basePx) * 100}%`;
}

function buildCardStyle(): CSSProperties {
  const card = COACHES_PAGE_CARD;
  const nameFontSize = `clamp(${card.nameFontSizeMinRem}rem, ${card.nameFontSizePreferredVw}vw, ${card.nameFontSizeMaxRem}rem)`;
  return {
    "--coaches-page-card-surface": card.surface,
    "--coaches-page-card-photo-expand-scale": String(card.photoExpandScale),
    "--coaches-page-card-radius": `${card.radiusPx}px`,
    "--coaches-page-card-name-color": card.nameColor,
    "--coaches-page-card-role-color": card.roleColor,
    "--coaches-page-card-bottom-bar-radius": `${card.bottomBarRadiusPx}px`,
    "--coaches-page-card-bottom-bar-height": `${card.bottomBarHeightPx}px`,
    "--coaches-page-card-expand-panel-height": `${card.expandPanelMinHeightPx}px`,
    "--coaches-page-card-expand-panel-padding": `${card.expandPanelPaddingPx}px`,
    "--coaches-page-card-expand-trigger-inset": `${card.expandTriggerInsetPx}px`,
    "--coaches-page-card-expand-arrow-size": `${card.expandArrowSizePx}px`,
    "--coaches-page-card-glass-blur": `${card.expandPanelGlassBlurPx}px`,
    "--coaches-page-card-glass-blur-expanded": `${card.expandPanelGlassBlurExpandedPx}px`,
    "--coaches-page-card-bottom-bar-fill": card.bottomBarFill,
    "--coaches-page-card-expand-glass-fill-expanded": card.expandPanelGlassFillExpanded,
    "--coaches-page-card-expand-glass-border": card.expandPanelGlassBorder,
    "--coaches-page-card-expand-bio-color": card.expandBioColor,
    "--coaches-page-card-name-top": cardInsetPercent(card.nameInsetTopPx, card.designHeightPx),
    "--coaches-page-card-name-left": cardInsetPercent(card.nameInsetLeftPx, card.designWidthPx),
    "--coaches-page-card-photo-top": cardInsetPercent(card.photoInsetTopPx, card.designHeightPx),
    "--coaches-page-card-photo-left": cardInsetPercent(card.photoInsetLeftPx, card.designWidthPx),
    "--coaches-page-card-name-font-size": nameFontSize,
    "--coaches-page-card-name-max-lines": String(card.nameMaxLines),
  } as CSSProperties;
}

function AdminCoachPortrait({
  coach,
  imageIndex,
}: {
  coach: AdminCoachDirectoryRow;
  imageIndex: number;
}) {
  const remoteSrc =
    coach.user.avatarUrl !== null
      ? resolveApiAssetUrl(coach.user.avatarUrl) ?? coach.user.avatarUrl
      : null;
  const imageSrc = remoteSrc ?? HOME_SECTION_ASSETS.coachPortrait;

  return (
    <div className={coachCardStyles.photoWrap} aria-hidden>
      <div className={coachCardStyles.photoInner}>
        <div className={coachCardStyles.photoFrame}>
          <div className={coachCardStyles.photoCrop}>
            <div className="relative h-full w-full">
              <Image
                src={imageSrc}
                alt=""
                fill
                sizes="(min-width: 1536px) 24vw, (min-width: 1024px) 32vw, (min-width: 768px) 44vw, 88vw"
                className="object-cover"
                style={{ objectPosition: "42% 18%" }}
                unoptimized={remoteSrc !== null}
                {...firstRowGridImageProps(imageIndex)}
              />
            </div>
          </div>
        </div>
      </div>
      {remoteSrc === null ? (
        <span className="absolute right-5 top-5 z-10 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-sage-700 shadow-sm backdrop-blur-md">
          {coachCardInitials(coach.user)}
        </span>
      ) : null}
    </div>
  );
}

function AdminCoachCardSummary({ coach }: { coach: AdminCoachDirectoryRow }) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={coachCardStyles.experience}>
          {t("workloadSummary", {
            classes: coach.totalClasses,
            slots: coach.schedule.length,
          })}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-sage-600">
          {coach.user.phone ?? "—"}
        </p>
      </div>
      <StatusBadge isActive={coach.isActive} />
    </div>
  );
}

function AdminCoachCardMetrics({ coach }: { coach: AdminCoachDirectoryRow }) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-sage-700">
      <MetricTile
        label={t("drawer.assignedClasses")}
        value={coach.assignedClassTypeIds.length}
      />
      <MetricTile label={t("drawer.availabilitySlots")} value={coach.schedule.length} />
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 backdrop-blur-sm">
      <span className="block uppercase tracking-[0.12em] text-sage-500">{label}</span>
      <span className="font-semibold text-sage-900">{value}</span>
    </div>
  );
}

function AdminCoachCardFooter({
  coach,
  classTypeOptions,
  classOptions,
  locale,
  onSelect,
}: AdminCoachBoardCardProps) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div className="mt-auto flex flex-col gap-3 border-t border-white/50 pt-3">
      <OmmButton
        type="button"
        variant="secondary"
        size="sm"
        className="h-9 rounded-full"
        onClick={() => onSelect(coach)}
      >
        {t("viewCoach")}
      </OmmButton>
      <div className="flex justify-center">
        <AdminCoachRowActions
          coach={coach}
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
          locale={locale}
        />
      </div>
    </div>
  );
}

export function AdminCoachBoardCard({
  coach,
  imageIndex,
  classTypeOptions,
  classOptions,
  locale,
  onSelect,
}: AdminCoachBoardCardProps) {
  const t = useTranslations("adminPages.coaches");
  const displayName = coachCardDisplayName(coach.user);
  const roleLine = coach.specialization?.trim() || t("fieldSpecialization");
  const bioText = coach.bio?.trim() || "—";

  return (
    <article
      className={`${marketingMontserrat.variable} ${coachCardStyles.card} ${coachCardStyles.cardExpanded} shadow-[0_22px_48px_-30px_rgba(45,55,60,0.35)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_60px_-32px_rgba(45,55,60,0.42)]`}
      style={buildCardStyle()}
    >
      <div className={coachCardStyles.cardAspect}>
        <div className={coachCardStyles.cardStage}>
          <div className={coachCardStyles.cardSurface} aria-hidden />
          <AdminCoachPortrait coach={coach} imageIndex={imageIndex} />
          <div className={coachCardStyles.header}>
            <p className={coachCardStyles.name}>{displayName}</p>
            <p className={coachCardStyles.role}>{roleLine}</p>
          </div>

          <div className={`${coachCardStyles.expandPanel} ${coachCardStyles.expandPanelExpanded}`}>
            <span aria-hidden className={coachCardStyles.expandPanelBackdrop} />
            <span aria-hidden className={coachCardStyles.expandPanelGlassRadial} />
            <span aria-hidden className={coachCardStyles.expandPanelGlassLinear} />
            <span aria-hidden className={coachCardStyles.expandPanelGlassBorder} />
            <div className={`${coachCardStyles.expandPanelBody} min-h-0`}>
              <AdminCoachCardSummary coach={coach} />
              <p className={`${coachCardStyles.bio} line-clamp-2`}>{bioText}</p>
              <AdminCoachCardMetrics coach={coach} />
              <AdminCoachCardFooter
                coach={coach}
                imageIndex={imageIndex}
                classTypeOptions={classTypeOptions}
                classOptions={classOptions}
                locale={locale}
                onSelect={onSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
