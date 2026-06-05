"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { marketingHeaderMobileMenuNavLinkClass } from "@/components/marketing/marketing-site-header-layout";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { Link } from "@/i18n/navigation";

type MarketingMobileMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
  marketingPath: string;
  isActive: (pathname: string, href: string) => boolean;
};

/** Matches panel enter/exit animations in `marketing-site-header-nav-pill.module.css`. */
const MARKETING_MOBILE_MENU_TRANSITION_MS = 260;

/** Mobile burger menu — fixed modal layer; white card only, page does not shift. */
export function MarketingMobileMenuModal({
  isOpen,
  onClose,
  navLinks,
  marketingPath,
  isActive,
}: MarketingMobileMenuModalProps) {
  const tNav = useTranslations("nav");
  const tUi = useTranslations("marketingUi");
  const isClientMounted = useIsClientMounted();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      return undefined;
    }

    const startTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, 0);
    const closeTimer = window.setTimeout(() => {
      setIsExiting(false);
    }, MARKETING_MOBILE_MENU_TRANSITION_MS);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(closeTimer);
    };
  }, [isOpen]);

  const isVisible = isOpen || isExiting;
  const isClosing = isExiting && !isOpen;

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isClientMounted || !isVisible) {
    return null;
  }

  const modalClassName = [
    marketingMontserrat.className,
    navPillStyles.mobileMenuModal,
    isClosing ? navPillStyles.mobileMenuModalClosing : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div
      className={modalClassName}
      role="dialog"
      aria-modal="true"
      aria-label={tUi("mobilePrimaryNavAria")}
      id="marketing-mobile-nav"
    >
      <button
        type="button"
        className={navPillStyles.mobileMenuScrim}
        aria-label={tUi("closeMenu")}
        onClick={onClose}
      />
      <div className={navPillStyles.mobileMenuCardSlot}>
        <div className={navPillStyles.mobilePanel}>
          <nav
            className="flex flex-col gap-1"
            aria-label={tUi("mobilePrimaryNavAria")}
          >
            {navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={marketingHeaderMobileMenuNavLinkClass(
                  isActive(marketingPath, href),
                )}
                onClick={onClose}
              >
                {tNav(key)}
              </Link>
            ))}
          </nav>
          <div className={navPillStyles.mobileDivider}>
            <Link
              href="/schedule"
              className={navPillStyles.mobileCtaPrimary}
              onClick={onClose}
            >
              {tUi("bookAClass")}
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
