import { StyleSheet, Text, View } from "react-native";
import type { ManagerClientListRow } from "../../../lib/api/clientsAdminClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type ManagerClientListCardProps = {
  row: ManagerClientListRow;
  planFallback: string;
};

export function clientDisplayName(row: ManagerClientListRow): string {
  const full = [row.name, row.lastName].filter(Boolean).join(" ").trim();
  return full.length > 0 ? full : row.email;
}

export function ManagerClientListCard({
  row,
  planFallback,
}: ManagerClientListCardProps) {
  const name = clientDisplayName(row);
  const plan = row.activePlanName?.trim() || planFallback;

  return (
    <View style={styles.card} accessibilityLabel={name}>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {row.email}
      </Text>
      {row.phone ? (
        <Text style={styles.meta} numberOfLines={1}>
          {row.phone}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.status}>{row.status}</Text>
        <Text style={styles.plan} numberOfLines={1}>
          {plan}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    gap: space.xs,
  },
  name: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.primaryGreen,
  },
  meta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    lineHeight: 18,
    color: colors.warmBrown,
  },
  footer: {
    marginTop: space.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  status: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.taupe,
  },
  plan: {
    flex: 1,
    textAlign: "right",
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.secondarySage,
  },
});
