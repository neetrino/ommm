import { type ImageSource } from "expo-image";
import { exploreBundledAssets } from "../../../../assets/exploreBundledAssets";
import { figmaRemoteAssets } from "../../../../assets/figmaRemoteAssets";
import type { ExploreTileMock } from "../../../../lib/mocks/homeMock";

export function resolveExploreImageSource(
  key: ExploreTileMock["imageUriKey"],
): ImageSource {
  return key === "explorePilates"
    ? exploreBundledAssets.pilates1_202
    : figmaRemoteAssets.exploreRetreat;
}
