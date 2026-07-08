import { useMemo } from "react";
import { useTranslations } from "../../../i18n/I18nProvider";
import type { ExploreTileMock } from "../../../lib/mocks/homeMock";

export type HomeGiftContent = {
  titleLead: string;
  titleAccent: string;
  subtitleLines: readonly string[];
  ctaLabel: string;
};

export type ExploreFallbackContent = {
  journalEyebrow: string;
  journalTitle: string;
  tiles: ExploreTileMock[];
};

export function useHomeGiftContent(): HomeGiftContent {
  const t = useTranslations("home.gift");

  return useMemo(() => {
    const body = t("body");
    return {
      titleLead: t("titleStart"),
      titleAccent: t("titleAccent"),
      subtitleLines: [body] as const,
      ctaLabel: t("primaryCta"),
    };
  }, [t]);
}

export function useExploreFallbackContent(): ExploreFallbackContent {
  const tFeatured = useTranslations("home.explore.featured");
  const tTiles = useTranslations("home.explore.tiles");

  return useMemo(
    () => ({
      journalEyebrow: tFeatured("eyebrow"),
      journalTitle: tFeatured("title"),
      tiles: [
        {
          id: "fallback-tuscany",
          tag: tTiles("tuscany.chip"),
          title: tTiles("tuscany.title"),
          imageUriKey: "exploreRetreat",
          tagVariant: "light",
          imageLayout: "square",
        },
        {
          id: "fallback-protocols",
          tag: tTiles("protocols.chip"),
          title: tTiles("protocols.title"),
          imageUriKey: "explorePilates",
          tagVariant: "dark",
          imageLayout: "roundedPortrait",
        },
      ],
    }),
    [tFeatured, tTiles],
  );
}

export function useHomeMarketingCopy() {
  const tBrand = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tMarketing = useTranslations("marketing");
  const tPublicHero = useTranslations("marketingPublic.hero");
  const tPublicHome = useTranslations("marketingPublic.home");
  const tHomeExplore = useTranslations("home.explore.featured");
  const tAccount = useTranslations("account.dashboard");

  return useMemo(
    () => ({
      hero: {
        eyebrow: tBrand("studioBrand"),
        titleLine1: tPublicHero("titleLine1"),
        titleAccent: tPublicHero("titleLine2"),
        lead: `${tPublicHero("subLine1")} ${tPublicHero("subLine2")}`,
        primaryCtaSignedIn: tMarketing("heroCta"),
        primaryCtaSignedOut: tCommon("login"),
        secondaryCta: tCommon("register"),
        footnote: tMarketing("closingBody"),
        footnoteSignedOut: tMarketing("closingBody"),
        previewEyebrow: tMarketing("storyTitle"),
        previewTitle: tHomeExplore("title"),
        previewCta: tHomeExplore("openLabel"),
      },
      highlights: {
        title: tPublicHome("homeFeaturesTitle"),
        lead: tPublicHome("homeFeaturesLead"),
        cta: tPublicHome("featureCardCta"),
        cards: [
          {
            key: "schedule" as const,
            title: tMarketing("featureScheduleTitle"),
            body: tMarketing("featureScheduleBody"),
          },
          {
            key: "packages" as const,
            title: tMarketing("featureMembershipsTitle"),
            body: tMarketing("featureMembershipsBody"),
          },
          {
            key: "journal" as const,
            title: tMarketing("featureUpdatesTitle"),
            body: tMarketing("featureUpdatesBody"),
          },
        ],
      },
      feedError: tAccount("waitlist.error"),
      feedLoading: tCommon("loading"),
    }),
    [tAccount, tBrand, tCommon, tHomeExplore, tMarketing, tPublicHero, tPublicHome],
  );
}
