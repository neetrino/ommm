import Image from "next/image";
import type { ReactNode } from "react";
import { firstRowGridImageProps } from "@/lib/image-loading-props";
import {
  coachCardDisplayName,
  coachCardInitials,
  type CoachCardUser,
} from "@/components/coaches/coach-card-display";

type PublicCoachCardProps = {
  user: CoachCardUser;
  specialization: string | null;
  experienceText?: string | null;
  bio: string | null;
  imageIndex?: number;
  onClick?: () => void;
  clickAriaLabel?: string;
  footer?: ReactNode;
  className?: string;
  /** Keeps admin board cards the same height with reserved text slots. */
  equalHeightLayout?: boolean;
};

const CARD_SURFACE =
  "ommm-card ommm-marketing-card-hover group flex w-full flex-col gap-6 p-6 text-left shadow-[0_24px_55px_-26px_rgba(45,40,35,0.24)] sm:p-7";

const CARD_MIN_HEIGHT = "min-h-[28rem]";
const CARD_UNIFORM_HEIGHT = "h-[32rem]";

/**
 * Shared coach profile card surface used on public Coaches pages and admin board view.
 */
export function PublicCoachCard({
  user,
  specialization,
  experienceText,
  bio,
  imageIndex = 0,
  onClick,
  clickAriaLabel,
  footer,
  className = "",
  equalHeightLayout = false,
}: PublicCoachCardProps) {
  const displayName = coachCardDisplayName(user);
  const isInteractive = onClick !== undefined;
  const surfaceClassName = [
    CARD_SURFACE,
    equalHeightLayout ? CARD_UNIFORM_HEIGHT : CARD_MIN_HEIGHT,
    isInteractive
      ? "cursor-pointer transition-transform duration-200 hover:-translate-y-1"
      : "transition-shadow duration-200 hover:shadow-[0_28px_60px_-26px_rgba(45,40,35,0.28)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div
        className="relative h-56 w-full shrink-0 overflow-hidden rounded-[24px] bg-gradient-to-br from-mint-100/90 to-sand-100 ring-1 ring-white/70"
        aria-hidden
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            fill
            sizes="(min-width:1024px) 22vw, (min-width:768px) 45vw, 92vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            {...firstRowGridImageProps(imageIndex)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-sage-700">
            {coachCardInitials(user.name, user.email)}
          </div>
        )}
      </div>
      <div className={`min-w-0 ${equalHeightLayout ? "flex min-h-0 flex-1 flex-col" : "flex-1"}`}>
        <h2 className="ommm-h3 shrink-0 text-sage-800 sm:text-[1.4rem]">{displayName}</h2>
        <p
          className={`mt-2 text-sm font-medium text-sand-700 ${
            equalHeightLayout ? "min-h-[1.375rem]" : specialization ? "" : "hidden"
          }`}
        >
          {specialization ?? (equalHeightLayout ? "\u00A0" : null)}
        </p>
        <p
          className={`mt-3 text-sm text-sage-500 ${
            equalHeightLayout ? "min-h-[1.25rem]" : experienceText ? "" : "hidden"
          }`}
        >
          {experienceText ?? (equalHeightLayout ? "\u00A0" : null)}
        </p>
        <p
          className={`mt-4 text-sm leading-relaxed text-sage-500 ${
            equalHeightLayout ? "line-clamp-3 min-h-[4.5rem]" : bio ? "line-clamp-3" : "hidden"
          }`}
        >
          {bio ?? (equalHeightLayout ? "\u00A0" : null)}
        </p>
      </div>
      {footer ? <div className="mt-auto border-t border-white/60 pt-4">{footer}</div> : null}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={surfaceClassName}
        aria-label={clickAriaLabel ?? displayName}
      >
        {body}
      </button>
    );
  }

  return <article className={surfaceClassName}>{body}</article>;
}
