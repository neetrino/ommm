import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { AppHeader } from "../../../components/layout/AppHeader";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { ScreenHeaderGapBackButton } from "../../../components/navigation/ScreenHeaderGapBackButton";
import { useTranslations } from "../../../i18n/I18nProvider";
import { space } from "../../../theme/tokens";
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
  const router = useRouter();
  const tProfile = useTranslations("userPages.profile");
  const onHeaderBookPress = useAppHeaderBookPress();
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
    useScreenChromeInsets({
      header: variant === "hub" ? "app" : "safe",
      contentGap: space.lg,
    });

  return (
    <View style={profileSectionLayout.root}>
      <GradientBackdrop />
      <ScrollView
        contentContainerStyle={[
          profileSectionLayout.content,
          { paddingTop, paddingBottom, paddingLeft, paddingRight },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {variant === "hub" ? (
          <View style={profileSectionLayout.hubShell}>{children}</View>
        ) : (
          <>
            {showBack || title ? (
              <View style={profileSectionLayout.pageHeader}>
                {showBack ? (
                  <ScreenHeaderGapBackButton
                    onPress={() => router.back()}
                    accessibilityLabel={tProfile("title")}
                  />
                ) : null}
                {title ? (
                  <Text style={profileSectionLayout.pageTitle}>{title}</Text>
                ) : null}
              </View>
            ) : null}
            {children}
          </>
        )}
      </ScrollView>
      {variant === "hub" ? <AppHeader onBookPress={onHeaderBookPress} /> : null}
    </View>
  );
}
