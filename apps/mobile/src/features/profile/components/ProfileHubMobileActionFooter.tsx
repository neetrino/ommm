import { StyleSheet, View } from "react-native";
import { LanguageSwitcher } from "../../../i18n/LanguageSwitcher";
import { memberAccountHubActionTokens } from "../memberAccountHubActionTokens";
import { ProfileHubLogoutButton } from "./ProfileHubLogoutButton";

/** Profile hub footer — language switcher above logout. */
export function ProfileHubMobileActionFooter() {
  return (
    <View style={styles.actionsFooter}>
      <LanguageSwitcher />
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
