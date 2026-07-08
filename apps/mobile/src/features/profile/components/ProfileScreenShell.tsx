import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircularBackButton } from "../../../components/navigation/CircularBackButton";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { useTranslations } from "../../../i18n/I18nProvider";
import { layout, space } from "../../../theme/tokens";
import { profileSectionLayout } from "../profileSectionLayout";

type ProfileScreenShellProps = {
  title?: string;
  children: ReactNode;
  /** Hub index — tighter top padding, centered column. */
  variant?: "hub" | "section";
  /** Section screens show a back control by default. */
  showBack?: boolean;
};

export function ProfileScreenShell({
  title,
  children,
  variant = "section",
  showBack = variant === "section",
}: ProfileScreenShellProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tProfile = useTranslations("userPages.profile");
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.lg;

  return (
    <View style={profileSectionLayout.root}>
      <GradientBackdrop />
      <ScrollView
        contentContainerStyle={[
          profileSectionLayout.content,
          { paddingBottom: bottomPad },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {variant === "hub" ? (
          <View style={profileSectionLayout.hubShell}>{children}</View>
        ) : (
          <>
            {showBack ? (
              <View style={profileSectionLayout.backRow}>
                <CircularBackButton
                  onPress={() => router.back()}
                  accessibilityLabel={tProfile("title")}
                />
              </View>
            ) : null}
            {title ? <Text style={profileSectionLayout.pageTitle}>{title}</Text> : null}
            {children}
          </>
        )}
      </ScrollView>
    </View>
  );
}
