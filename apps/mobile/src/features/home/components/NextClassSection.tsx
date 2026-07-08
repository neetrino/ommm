import { Pressable, Text, View } from "react-native";
import { useTranslations } from "../../../i18n/I18nProvider";
import { NextClassDetailsPanel } from "./next-class/NextClassDetailsPanel";
import { NextClassHeroCard } from "./next-class/NextClassHeroCard";
import { nextClassStyles as styles } from "./next-class/nextClassStyles";
import type { NextClassSectionProps } from "./next-class/nextClassTypes";

export type { NextClassContent } from "./next-class/nextClassTypes";

export function NextClassSection({
  content,
  onAllEventsPress,
  onOpenClassPress,
}: NextClassSectionProps) {
  const tHome = useTranslations("home");
  const tDashboard = useTranslations("account.dashboard.nextClass");

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{tDashboard("eyebrow")}</Text>
        <Pressable
          onPress={onAllEventsPress}
          accessibilityRole="button"
          accessibilityLabel={tHome("explore.allEvents")}
        >
          <Text style={styles.allEvents}>{tHome("explore.allEvents").toUpperCase()}</Text>
        </Pressable>
      </View>

      <NextClassHeroCard content={content} onOpenClassPress={onOpenClassPress} />
      <NextClassDetailsPanel content={content} />
    </View>
  );
}
