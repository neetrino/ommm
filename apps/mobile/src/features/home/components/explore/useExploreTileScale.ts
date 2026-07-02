import { useWindowDimensions } from "react-native";
import { exploreTile, space } from "../../../../theme/tokens";

export function useExploreTileScale() {
  const { width: windowWidth } = useWindowDimensions();
  const exploreTileWidth =
    (windowWidth - space.screenHorizontal * 2 - space.md) / 2;
  const exploreScale = exploreTileWidth / exploreTile.baseWidth;

  return exploreScale;
}
