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
