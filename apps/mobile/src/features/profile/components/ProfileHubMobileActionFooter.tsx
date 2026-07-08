import { StyleSheet, View } from "react-native";
import { memberAccountHubActionTokens } from "../memberAccountHubActionTokens";
import { ProfileHubLogoutButton } from "./ProfileHubLogoutButton";

/** Profile hub footer — logout only; delete lives in Account Information danger zone. */
export function ProfileHubMobileActionFooter() {
  return (
    <View style={styles.actionsFooter}>
      <ProfileHubLogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  actionsFooter: {
    width: "100%",
    gap: memberAccountHubActionTokens.footerGap,
    marginTop: memberAccountHubActionTokens.footerMarginTop,
  },
});
