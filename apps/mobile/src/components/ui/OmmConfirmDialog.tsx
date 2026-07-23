import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { fontFamilies } from "../../theme/fontFamilies";
import { platformShadow } from "../../theme/platformShadow";
import { radii, space, typography } from "../../theme/tokens";
import { ommConfirmDialogTokens as tokens } from "./ommConfirmDialogTokens";

export type OmmConfirmDialogTone = "default" | "danger";

type OmmConfirmDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  backdropAriaLabel: string;
  pending?: boolean;
  tone?: OmmConfirmDialogTone;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function OmmConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel,
  backdropAriaLabel,
  pending = false,
  tone = "default",
  errorMessage = null,
  onConfirm,
  onCancel,
}: OmmConfirmDialogProps) {
  const isDanger = tone === "danger";
  const panelBorder = isDanger ? tokens.danger.panelBorder : tokens.default.panelBorder;
  const panelBackground = isDanger ? "transparent" : tokens.default.panelBackground;
  const shadowTone = isDanger ? tokens.danger : tokens.default;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={pending ? undefined : onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={pending ? undefined : onCancel}
        accessibilityRole="button"
        accessibilityLabel={backdropAriaLabel}
      >
        <Pressable style={styles.panelWrap} onPress={(event) => event.stopPropagation()}>
          <View
            style={[
              styles.panel,
              {
                borderColor: panelBorder,
                backgroundColor: panelBackground,
              },
              platformShadow({
                color: shadowTone.shadowColor,
                offsetHeight: shadowTone.shadowOffsetY,
                opacity: shadowTone.shadowOpacity,
                radius: shadowTone.shadowRadius,
                elevation: 8,
              }),
            ]}
            accessibilityRole="alert"
            accessibilityLabel={title}
          >
            {isDanger ? (
              <LinearGradient
                colors={[...tokens.danger.gradient]}
                start={tokens.danger.gradientStart}
                end={tokens.danger.gradientEnd}
                style={StyleSheet.absoluteFill}
              />
            ) : null}

            <View style={styles.content}>
              <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
                {errorMessage !== null && errorMessage !== "" ? (
                  <Text style={styles.errorMessage} accessibilityLiveRegion="polite">
                    {errorMessage}
                  </Text>
                ) : null}
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={onCancel}
                  disabled={pending}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && !pending && styles.buttonPressed,
                    pending && styles.buttonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={cancelLabel}
                  accessibilityState={{ disabled: pending }}
                >
                  <Text style={styles.cancelLabel}>{cancelLabel}</Text>
                </Pressable>

                <Pressable
                  onPress={onConfirm}
                  disabled={pending}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    isDanger && styles.confirmButtonDanger,
                    pressed && !pending && styles.buttonPressed,
                    pending && styles.buttonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={confirmLabel}
                  accessibilityState={{ disabled: pending, busy: pending }}
                >
                  {pending ? (
                    <ActivityIndicator
                      size="small"
                      color={isDanger ? tokens.danger.confirmText : tokens.titleColor}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.confirmLabel,
                        isDanger && styles.confirmLabelDanger,
                      ]}
                    >
                      {confirmLabel}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: tokens.backdrop,
    justifyContent: "center",
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  panelWrap: {
    width: "100%",
    maxWidth: tokens.panelMaxWidth,
    maxHeight: "90%",
    alignSelf: "center",
  },
  panel: {
    borderRadius: tokens.panelRadius,
    borderWidth: 1,
    overflow: "hidden",
  },
  content: {
    gap: tokens.panelGap,
    padding: tokens.panelPadding,
  },
  textBlock: {
    gap: tokens.textGap,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: typography.sectionTitle + 4,
    lineHeight: 30,
    color: tokens.titleColor,
  },
  description: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 22,
    color: tokens.descriptionColor,
  },
  errorMessage: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: "#991b1b",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: tokens.actionsGap,
    paddingTop: 4,
  },
  cancelButton: {
    minHeight: tokens.buttonMinHeight,
    paddingHorizontal: tokens.buttonPaddingHorizontal,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: tokens.cancel.border,
    backgroundColor: tokens.cancel.background,
  },
  confirmButton: {
    minHeight: tokens.buttonMinHeight,
    paddingHorizontal: tokens.buttonPaddingHorizontal,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: tokens.cancel.border,
    backgroundColor: tokens.cancel.background,
  },
  confirmButtonDanger: {
    borderColor: tokens.danger.confirmBorder,
    backgroundColor: tokens.danger.confirmBackground,
  },
  cancelLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    letterSpacing: tokens.buttonLetterSpacing,
    textTransform: "uppercase",
    color: tokens.cancel.text,
  },
  confirmLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    letterSpacing: tokens.buttonLetterSpacing,
    textTransform: "uppercase",
    color: tokens.cancel.text,
  },
  confirmLabelDanger: {
    color: tokens.danger.confirmText,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
