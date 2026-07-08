import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { uploadHomeImage } from "../../../lib/api/usersClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

const HOME_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function ProfileHomeImageSection() {
  const { refreshProfile, homeImageUri } = useSession();
  const [busy, setBusy] = useState(false);
  const [localPreviewUri, setLocalPreviewUri] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const displayPreviewUri = localPreviewUri ?? homeImageUri;

  const onChooseAndUploadPress = useCallback(async () => {
    if (busy) {
      return;
    }

    setFeedback(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setFeedback({
        kind: "err",
        text: "Photo library access is required to choose an image.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.88,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    if (
      typeof asset.fileSize === "number" &&
      asset.fileSize > HOME_IMAGE_MAX_BYTES
    ) {
      setFeedback({
        kind: "err",
        text: "Image is too large. Maximum size is 5 MB.",
      });
      return;
    }

    setBusy(true);
    setLocalPreviewUri(asset.uri);
    try {
      await uploadHomeImage({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? undefined,
      });
      setFeedback({ kind: "ok", text: "Photo updated successfully." });
      await refreshProfile();
      setLocalPreviewUri(null);
    } catch (e) {
      setLocalPreviewUri(null);
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [busy, refreshProfile]);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Profile photo</Text>
      <Text style={styles.sectionLead}>
        Shown on your Home tab and account pages. JPG, PNG, or WEBP up to 5 MB.
      </Text>

      {displayPreviewUri !== null && displayPreviewUri !== "" ? (
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: displayPreviewUri }}
            style={styles.previewImage}
            contentFit="cover"
            accessibilityRole="image"
            accessibilityLabel="Profile photo preview"
          />
        </View>
      ) : (
        <Text style={styles.placeholder}>
          No custom photo yet — default layout applies.
        </Text>
      )}

      {feedback ? (
        <Text
          style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackErr}
          accessibilityLiveRegion="polite"
        >
          {feedback.text}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void onChooseAndUploadPress()}
        disabled={busy}
        style={({ pressed }) => [
          styles.primaryBtn,
          pressed && !busy && styles.primaryPressed,
          busy && styles.btnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Choose profile photo"
        accessibilityState={{ disabled: busy }}
      >
        {busy ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryLabel}>Choose image</Text>
        )}
      </Pressable>
    </View>
  );
}

const PREVIEW_HEIGHT = 200;

const styles = StyleSheet.create({
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite38,
  },
  sectionTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  sectionLead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.secondarySage,
  },
  previewWrap: {
    borderRadius: radii.labelCard,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.primaryGreen,
  },
  previewImage: {
    width: "100%",
    height: PREVIEW_HEIGHT,
  },
  placeholder: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    fontStyle: "italic",
  },
  feedbackOk: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  feedbackErr: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  primaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
  },
  primaryPressed: {
    opacity: 0.92,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  primaryLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
  },
});
