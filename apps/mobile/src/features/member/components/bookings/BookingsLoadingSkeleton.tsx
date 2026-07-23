import { StyleSheet, View } from "react-native";
import { colors, radii, space } from "../../../../theme/tokens";

const SKELETON_COUNT = 3;

function SkeletonBlock({
  width,
  height,
  radius = radii.pill,
}: {
  width: number | `${number}%`;
  height: number;
  radius?: number;
}) {
  return (
    <View
      style={[
        styles.block,
        { width, height, borderRadius: radius },
      ]}
    />
  );
}

function BookingCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <SkeletonBlock width="36%" height={12} />
          <SkeletonBlock width="72%" height={22} radius={radii.labelCard} />
        </View>
        <SkeletonBlock width={72} height={24} />
      </View>
      <View style={styles.panel}>
        <SkeletonBlock width="100%" height={14} />
        <SkeletonBlock width="88%" height={14} />
        <View style={styles.metaRow}>
          <SkeletonBlock width="42%" height={14} />
          <SkeletonBlock width="42%" height={14} />
        </View>
      </View>
    </View>
  );
}

export function BookingsLoadingSkeleton() {
  return (
    <View style={styles.list}>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <BookingCardSkeleton key={`booking-skeleton-${index}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
    gap: space.md,
  },
  card: {
    width: "100%",
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    padding: space.lg,
    gap: space.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.sm,
  },
  headerText: {
    flex: 1,
    gap: space.xs,
  },
  panel: {
    gap: space.sm,
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.overlayWhite20,
    backgroundColor: colors.overlayWhite10,
    padding: space.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.md,
  },
  block: {
    backgroundColor: colors.badgeCream,
    opacity: 0.85,
  },
});
