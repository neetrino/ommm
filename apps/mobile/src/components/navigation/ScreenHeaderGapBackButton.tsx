import { StyleSheet, View } from "react-native";
import { APP_HEADER_CONTENT_GAP } from "../layout/screenChromeLayout";
import {
  CircularBackButton,
  CIRCULAR_BACK_BUTTON_SIZE,
} from "./CircularBackButton";

/** Vertical band under AppHeader where the back control is centered. */
export const HEADER_GAP_BACK_BAND_HEIGHT =
  APP_HEADER_CONTENT_GAP + CIRCULAR_BACK_BUTTON_SIZE;

type ScreenHeaderGapBackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

/**
 * Places the circular back control vertically centered in the gap
 * between AppHeader and the page title. Pair with
 * `useScreenChromeInsets({ headerContentGap: 0 })`.
 */
export function ScreenHeaderGapBackButton({
  onPress,
  accessibilityLabel,
}: ScreenHeaderGapBackButtonProps) {
  return (
    <View style={styles.band}>
      <CircularBackButton
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    height: HEADER_GAP_BACK_BAND_HEIGHT,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
});
