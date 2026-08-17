import type { ReactNode } from "react";

type SessionClassTitleProps = {
  name: string;
  eyebrow?: string;
  variant: "board" | "list" | "week";
  trailing?: ReactNode;
  className?: string;
};

export function SessionClassTitle({
  name,
  eyebrow,
  variant,
  trailing,
  className = "",
}: SessionClassTitleProps) {
  if (variant === "week") {
    return (
      <div className={`flex min-h-[3.5rem] min-w-0 flex-col justify-start ${className}`.trim()}>
        <p className="h-4 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-sand-600">
          {eyebrow ?? "\u00A0"}
        </p>
        <h3
          className="mt-0.5 line-clamp-2 font-serif text-base font-normal leading-snug tracking-tight text-sage-950"
          title={name}
        >
          {name}
        </h3>
      </div>
    );
  }

  if (variant === "board") {
    return (
      <div className={`flex items-start justify-between gap-3 ${className}`.trim()}>
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sand-600">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="font-serif text-[clamp(1.35rem,1.2vw+1rem,1.85rem)] font-normal leading-[1.15] tracking-tight text-sage-950">
            {name}
          </h3>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    );
  }

  return (
    <div className={`min-w-0 ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sand-600">
          {eyebrow}
        </p>
      ) : null}
      <p className="block w-full min-w-0 truncate font-serif text-xl leading-snug tracking-tight text-sage-950 sm:text-[1.35rem]" title={name}>
        {name}
      </p>
    </div>
  );
}
