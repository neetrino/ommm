import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { accountHubLayout } from "../accountHubLayout";

const AVATAR_WRAP_GRADIENT = {
  colors: ["rgba(255,255,255,0.92)", "rgba(244,223,203,0.45)"] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

type AccountHubHeaderProps = {
  displayName: string;
  avatarImageUri?: string | null;
  initials?: string;
};

function splitDisplayName(displayName: string): {
  givenName: string;
  surname: string | null;
} {
  const trimmed = displayName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex <= 0) {
    return { givenName: trimmed, surname: null };
  }
  const givenName = trimmed.slice(0, spaceIndex).trim();
  const surname = trimmed.slice(spaceIndex + 1).trim();
  return {
    givenName: givenName.length > 0 ? givenName : trimmed,
    surname: surname.length > 0 ? surname : null,
  };
}

export function AccountHubHeader({
  displayName,
  avatarImageUri,
  initials,
}: AccountHubHeaderProps) {
  const { givenName, surname } = splitDisplayName(displayName);

  return (
    <View style={accountHubLayout.header}>
      <LinearGradient
        colors={[...AVATAR_WRAP_GRADIENT.colors]}
        start={AVATAR_WRAP_GRADIENT.start}
        end={AVATAR_WRAP_GRADIENT.end}
        style={accountHubLayout.avatarWrap}
      >
        <View style={accountHubLayout.avatarRing}>
          {avatarImageUri ? (
            <Image
              source={{ uri: avatarImageUri }}
              style={accountHubLayout.avatarImage}
              contentFit="cover"
              accessibilityLabel="Your profile photo"
            />
          ) : initials ? (
            <View style={accountHubLayout.avatarInitialsShell}>
              <Text style={accountHubLayout.avatarInitialsText}>{initials}</Text>
            </View>
          ) : (
            <View
              style={accountHubLayout.avatarPlaceholder}
              accessibilityLabel="Profile avatar"
            />
          )}
        </View>
      </LinearGradient>
      <View style={accountHubLayout.textBlock}>
        <Text
          style={accountHubLayout.name}
          numberOfLines={2}
          accessibilityLabel={displayName}
        >
          {givenName}
          {surname !== null ? (
            <Text style={accountHubLayout.nameSurname}>{` ${surname}`}</Text>
          ) : null}
        </Text>
      </View>
    </View>
  );
}
