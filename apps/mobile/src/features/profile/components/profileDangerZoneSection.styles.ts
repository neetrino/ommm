import { StyleSheet } from "react-native";
import { profileSectionCardBase, profileSectionLayout } from "../profileSectionLayout";

const DANGER_ZONE_TITLE = "#991b1b";
const DANGER_ZONE_LEAD = "rgba(127, 29, 29, 0.82)";
const DANGER_ZONE_BORDER = "rgba(252, 165, 165, 0.75)";
const DANGER_ZONE_TINT = "rgba(254, 242, 242, 0.42)";

export const profileDangerZoneSectionStyles = StyleSheet.create({
  card: profileSectionCardBase,
  dangerFrame: {
    borderColor: DANGER_ZONE_BORDER,
    backgroundColor: DANGER_ZONE_TINT,
  },
  sectionTitle: {
    ...profileSectionLayout.sectionTitle,
    color: DANGER_ZONE_TITLE,
  },
  sectionLead: {
    ...profileSectionLayout.sectionLead,
    color: DANGER_ZONE_LEAD,
  },
});
