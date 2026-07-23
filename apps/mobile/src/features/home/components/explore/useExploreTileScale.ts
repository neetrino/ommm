import { useWindowDimensions } from "react-native";
import { exploreTile, space } from "../../../../theme/tokens";

/** Cap tile image height so landscape width does not inflate portrait clips. */
const EXPLORE_TILE_MAX_HEIGHT_RATIO = 0.42;

export function useExploreTileScale() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const exploreTileWidth =
    (windowWidth - space.screenHorizontal * 2 - space.md) / 2;
  const widthScale = exploreTileWidth / exploreTile.baseWidth;
  const heightCap =
    (windowHeight * EXPLORE_TILE_MAX_HEIGHT_RATIO) /
    exploreTile.pilatesClipHeight;

  return Math.min(widthScale, heightCap);
}
