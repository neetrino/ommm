type MarketingHeaderIconProps = {
  className?: string;
};

/** Figma `196:1451` — user / account affordance. */
export function MarketingHeaderUserIcon({ className }: MarketingHeaderIconProps) {
  return (
    <svg
      viewBox="0 0 26 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M13 14.5C14.9702 14.5 16.8597 13.7362 18.2528 12.3765C19.6459 11.0169 20.4286 9.17282 20.4286 7.25C20.4286 5.32718 19.6459 3.48311 18.2528 2.12348C16.8597 0.763837 14.9702 0 13 0C11.0298 0 9.14033 0.763837 7.74721 2.12348C6.35408 3.48311 5.57143 5.32718 5.57143 7.25C5.57143 9.17282 6.35408 11.0169 7.74721 12.3765C9.14033 13.7362 11.0298 14.5 13 14.5ZM10.3478 17.2188C4.63125 17.2188 0 21.7387 0 27.3178C0 28.2467 0.771875 29 1.72366 29H24.2763C25.2281 29 26 28.2467 26 27.3178C26 21.7387 21.3688 17.2188 15.6522 17.2188H10.3478Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Figma mobile HEADER `108:6841` — menu affordance. */
export function MarketingHeaderMenuIcon({ className }: MarketingHeaderIconProps) {
  return (
    <svg
      width={35}
      height={35}
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M7.5 10.25h20M7.5 17.5h20M7.5 24.75h20"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Header notification bell — outline, matches shell action icons. */
export function MarketingHeaderBellIcon({ className }: MarketingHeaderIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 10a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10 21h4" />
    </svg>
  );
}

/** Decorative header bell — no menu until notifications are wired. */
export function MarketingHeaderNotificationsPlaceholder({
  className,
  iconClassName,
}: {
  className: string;
  iconClassName: string;
}) {
  return (
    <span className={`relative inline-flex items-center ${className}`} aria-hidden>
      <MarketingHeaderBellIcon className={iconClassName} />
    </span>
  );
}

/** Figma `196:1453` — language switcher affordance. */
export function MarketingHeaderGlobeIcon({ className }: MarketingHeaderIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M10.8571 16C10.8579 15.0179 10.8971 14.0655 10.9749 13.1429H21.0251C21.1029 14.0655 21.1421 15.0179 21.1429 16C21.1472 17.722 21.015 19.4417 20.7474 21.1429H11.2526C10.9855 19.4417 10.8533 17.722 10.8571 16ZM9.51771 21.1429C9.13299 18.4943 9.04482 15.811 9.25486 13.1429H2.584C2.38482 14.0822 2.28485 15.0398 2.28571 16C2.28571 17.8183 2.64 19.5543 3.28229 21.1429H9.51771ZM4.12 22.8571H9.82857C10.1246 24.248 10.5086 25.52 10.9657 26.6297C11.3737 27.6194 11.8469 28.5017 12.3851 29.232C8.89964 28.2759 5.92966 25.9857 4.12 22.8571ZM11.584 22.8571H20.4183C20.1826 23.922 19.8592 24.9656 19.4514 25.9771C18.9337 27.2343 18.3394 28.1943 17.7223 28.8286C17.1086 29.4594 16.5257 29.7143 16 29.7143C15.4743 29.7143 14.8926 29.4594 14.2789 28.8286C13.6617 28.1954 13.0674 27.2343 12.5497 25.9771C12.1419 24.9656 11.8197 23.922 11.584 22.8571ZM22.1726 22.8571C21.9086 24.1465 21.528 25.4093 21.0354 26.6297C20.6274 27.6194 20.1543 28.5017 19.616 29.232C23.1011 28.2756 26.0695 25.9855 27.8789 22.8571H22.1726ZM28.7177 21.1429C29.36 19.5543 29.7143 17.8183 29.7143 16C29.7143 15.0206 29.6114 14.064 29.4171 13.1429H22.7451C22.9552 15.811 22.867 18.4943 22.4823 21.1429H28.7177ZM19.4491 6.02286C20.0629 7.50971 20.5429 9.35314 20.8331 11.4286H11.1669C11.4571 9.35314 11.9371 7.50971 12.5497 6.02286C13.0674 4.76571 13.6617 3.80571 14.2789 3.17143C14.8914 2.54057 15.4743 2.28571 16 2.28571C16.5257 2.28571 17.1074 2.54057 17.7211 3.17143C18.3383 3.80457 18.9314 4.76571 19.4491 6.02286ZM22.5646 11.4286H28.9349C28.1942 9.34122 26.9602 7.4637 25.3379 5.95581C23.7156 4.44792 21.753 3.35429 19.6171 2.768C20.1543 3.49829 20.6286 4.38057 21.0366 5.37029C21.7337 7.06514 22.2617 9.13371 22.5646 11.4286ZM3.06743 11.4286H9.43771C9.74057 9.13371 10.2686 7.06514 10.9657 5.37029C11.3737 4.38057 11.8469 3.49829 12.3851 2.768C10.2491 3.35413 8.28625 4.44768 6.66373 5.95559C5.04122 7.46349 3.8082 9.34109 3.06743 11.4286Z"
        fill="currentColor"
      />
    </svg>
  );
}
