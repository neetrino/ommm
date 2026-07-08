import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import type { UploadPickResult } from "../../../lib/api/usersClient";
import { deleteHomeImage, uploadHomeImage } from "../../../lib/api/usersClient";
import { useTranslations } from "../../../i18n/I18nProvider";
import { colors } from "../../../theme/tokens";
import { ProfileGlassCard } from "./ProfileGlassCard";
import { profileHomeImageSectionStyles as styles } from "./profileHomeImageSection.styles";

const HOME_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function ProfileHomeImageSection() {
  const { refreshProfile, homeImageUri, profileInitials } = useSession();
  const tHomeImage = useTranslations("forms.homeImage");
  const tProfile = useTranslations("userPages.profile");
  const [pendingPick, setPendingPick] = useState<UploadPickResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const hasPendingPreview = pendingPick !== null;
  const hasSavedPhoto =
    !hasPendingPreview && homeImageUri !== null && homeImageUri !== "";
  const displayPreviewUri = hasPendingPreview ? pendingPick.uri : homeImageUri;

  const onChoosePress = useCallback(async () => {
    if (busy || hasPendingPreview) {
      return;
    }

    setFeedback(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setFeedback({
        kind: "err",
        text: tHomeImage("readFailed"),
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
        text: tHomeImage("tooLarge"),
      });
      return;
    }

    setPendingPick({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? undefined,
    });
  }, [busy, hasPendingPreview]);

  const onRemovePendingPress = useCallback(() => {
    if (busy) {
      return;
    }
    setPendingPick(null);
    setFeedback(null);
  }, [busy]);

  const onDeleteSavedPress = useCallback(async () => {
    if (busy || !hasSavedPhoto) {
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await deleteHomeImage();
      setFeedback({ kind: "ok", text: tHomeImage("deletePhotoSuccess") });
      await refreshProfile();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : tHomeImage("deletePhotoFailed");
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [busy, hasSavedPhoto, refreshProfile]);

  const onConfirmPress = useCallback(async () => {
    if (busy || pendingPick === null) {
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await uploadHomeImage(pendingPick);
      setFeedback({ kind: "ok", text: tHomeImage("uploadSuccess") });
      setPendingPick(null);
      await refreshProfile();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : tHomeImage("uploadFailed");
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [busy, pendingPick, refreshProfile, tHomeImage]);

  return (
    <ProfileGlassCard contentStyle={styles.card}>
      <Text style={styles.sectionTitle}>{tProfile("homeImage")}</Text>
      <Text style={styles.sectionLead}>{tProfile("homeImageLead")}</Text>

      {displayPreviewUri !== null && displayPreviewUri !== "" ? (
        <View
          style={[
            styles.previewWrap,
            hasPendingPreview && styles.previewWrapPending,
          ]}
        >
          <Image
            source={{ uri: displayPreviewUri }}
            style={styles.previewImage}
            contentFit="cover"
            accessibilityRole="image"
            accessibilityLabel={tHomeImage("previewAlt")}
          />
        </View>
      ) : (
        <View style={styles.initialsPreviewWrap}>
          <Text style={styles.initialsPreviewText}>{profileInitials}</Text>
        </View>
      )}

      {hasPendingPreview ? (
        <Text style={styles.pendingHint}>{tHomeImage("pendingHint")}</Text>
      ) : null}

      {feedback ? (
        <Text
          style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackErr}
          accessibilityLiveRegion="polite"
        >
          {feedback.text}
        </Text>
      ) : null}

      {hasPendingPreview ? (
        <View style={styles.row}>
          <Pressable
            onPress={onRemovePendingPress}
            disabled={busy}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && !busy && styles.secondaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={tHomeImage("removePending")}
            accessibilityState={{ disabled: busy }}
          >
            <Text style={styles.removeLabel}>{tHomeImage("removePending")}</Text>
          </Pressable>

          <Pressable
            onPress={() => void onConfirmPress()}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && !busy && styles.primaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={tHomeImage("confirm")}
            accessibilityState={{ disabled: busy }}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryLabel}>{tHomeImage("confirm")}</Text>
            )}
          </Pressable>
        </View>
      ) : hasSavedPhoto ? (
        <View style={styles.row}>
          <Pressable
            onPress={() => void onChoosePress()}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && !busy && styles.primaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={tHomeImage("chooseImage")}
            accessibilityState={{ disabled: busy }}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryLabel}>{tHomeImage("chooseImage")}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => void onDeleteSavedPress()}
            disabled={busy}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && !busy && styles.secondaryPressed,
              busy && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={tHomeImage("deletePhoto")}
            accessibilityState={{ disabled: busy }}
          >
            <Text style={styles.removeLabel}>{tHomeImage("deletePhoto")}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => void onChoosePress()}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && !busy && styles.primaryPressed,
            busy && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={tHomeImage("chooseImage")}
          accessibilityState={{ disabled: busy }}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryLabel}>{tHomeImage("chooseImage")}</Text>
          )}
        </Pressable>
      )}
    </ProfileGlassCard>
  );
}
