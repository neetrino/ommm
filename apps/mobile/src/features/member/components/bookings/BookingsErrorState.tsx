import { StyleSheet, Text, View } from "react-native";
import { PackagesPrimaryCta } from "../../../packages/components/PackagesScreenActions";
import { fontFamilies } from "../../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../../theme/tokens";

type BookingsErrorStateProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export function BookingsErrorState({
  message,
  retryLabel,
  onRetry,
}: BookingsErrorStateProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.message}>{message}</Text>
      <PackagesPrimaryCta label={retryLabel} onPress={onRetry} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: "rgba(139, 46, 46, 0.18)",
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.md,
    alignItems: "flex-start",
  },
  message: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: colors.warmBrown,
  },
});
