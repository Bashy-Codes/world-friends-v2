import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ImagePickerSheet, ImagePickerSheetRef } from "@/components/common/ImagePickerSheet";
import { api } from "@/convex/_generated/api";
import { uploadImageToConvex } from "@/utils/uploadImages";
import { Id } from "@/convex/_generated/dataModel";
import Toast from "react-native-toast-message";
import { InfoSection } from "@/components/common/InfoSection";
import { Button } from "@/components/ui/Button";

type ReportType =
  | "harassment"
  | "hate_speech"
  | "inappropriate_content"
  | "spam"
  | "other";

interface ReportParams {
  type: "user" | "post";
  targetId: string;
  targetName?: string;
}

const getReportTypes = (
  t: any
): { value: ReportType; label: string; description: string }[] => [
  {
    value: "harassment",
    label: t("report.types.harassment.label"),
    description: t("report.types.harassment.description"),
  },
  {
    value: "hate_speech",
    label: t("report.types.hate_speech.label"),
    description: t("report.types.hate_speech.description"),
  },
  {
    value: "inappropriate_content",
    label: t("report.types.inappropriate_content.label"),
    description: t("report.types.inappropriate_content.description"),
  },
  {
    value: "spam",
    label: t("report.types.spam.label"),
    description: t("report.types.spam.description"),
  },
  {
    value: "other",
    label: t("report.types.other.label"),
    description: t("report.types.other.description"),
  },
];

export default function ReportScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as ReportParams;

  // State
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [reason, setReason] = useState("");
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get translated report types
  const REPORT_TYPES = getReportTypes(t);

  // Refs
  const imagePickerRef = useRef<ImagePickerSheetRef>(null);

  // Mutations
  const reportUser = useMutation(api.moderation.reportUser);
  const reportPost = useMutation(api.moderation.reportPost);
  const generateConvexUploadUrl = useMutation(
    api.storage.generateConvexUploadUrl
  );

  const handleImageSelected = useCallback((imageUri: string) => {
    setAttachmentUri(imageUri);
  }, []);

  const handleAddPhoto = useCallback(() => {
    imagePickerRef.current?.present();
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setAttachmentUri(null);
  }, []);

  const validateForm = useCallback(() => {
    // use one validation error for all these
    if (!selectedType && reason.trim().length < 10 && !attachmentUri) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.validationError.text1"),
        text2: t("errorToasts.validationError.text2"),
        position: "top",
      });
      return false;
    }

    return true;
  }, [selectedType, reason, attachmentUri, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Upload the attachment image
      const uploadResult = await uploadImageToConvex(
        attachmentUri!,
        generateConvexUploadUrl
      );
      if (!uploadResult) {
        throw new Error("Failed to upload attachment");
      }

      // Submit the report
      if (params.type === "user") {
        await reportUser({
          reportedUserId: params.targetId as Id<"users">,
          reportType: selectedType!,
          reportReason: reason.trim(),
          attachment: uploadResult.storageId as Id<"_storage">,
        });
      } else {
        await reportPost({
          postId: params.targetId as Id<"posts">,
          reportType: selectedType!,
          reportReason: reason.trim(),
          attachment: uploadResult.storageId as Id<"_storage">,
        });
      }

      Toast.show({
        type: "success",
        text1: t("successToasts.reportSubmitted.text1"),
        text2: t("successToasts.reportSubmitted.text2"),
        position: "top",
      });

      router.back();
    } catch (error) {
      console.error("Report submission error:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2: t("errorToasts.genericError.text2"),
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    attachmentUri,
    generateConvexUploadUrl,
    params.type,
    params.targetId,
    selectedType,
    reason,
    reportUser,
    reportPost,
    router,
    t,
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      padding: scale(20),
    },
    section: {
      marginBottom: verticalScale(24),
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: verticalScale(12),
    },
    description: {
      fontSize: moderateScale(14),
      color: theme.colors.textSecondary,
      marginBottom: verticalScale(16),
      lineHeight: moderateScale(20),
    },
    reportTypeContainer: {
      marginBottom: verticalScale(8),
    },
    reportTypeButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: scale(16),
      borderRadius: scale(theme.borderRadius.md),
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    reportTypeButtonSelected: {
      borderColor: theme.colors.primary,
    },
    reportTypeContent: {
      flex: 1,
      marginLeft: scale(12),
    },
    reportTypeLabel: {
      fontSize: moderateScale(16),
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: verticalScale(2),
    },
    reportTypeDescription: {
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
      lineHeight: moderateScale(16),
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: scale(theme.borderRadius.md),
      padding: scale(16),
      fontSize: moderateScale(16),
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      textAlignVertical: "top",
      minHeight: verticalScale(120),
    },
    textInputFocused: {
      borderColor: theme.colors.primary,
    },
    characterCount: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
      textAlign: "right",
      marginTop: verticalScale(4),
    },
    attachmentSection: {
      marginBottom: verticalScale(24),
    },
    attachmentButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: scale(16),
      borderRadius: scale(theme.borderRadius.md),
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    attachmentButtonText: {
      fontSize: moderateScale(16),
      color: theme.colors.textSecondary,
      marginLeft: scale(8),
    },
    attachmentPreview: {
      position: "relative",
      borderRadius: scale(theme.borderRadius.md),
      overflow: "hidden",
    },
    attachmentImage: {
      width: "100%",
      height: verticalScale(200),
    },
    removeButton: {
      position: "absolute",
      top: scale(8),
      right: scale(8),
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: scale(20),
      padding: scale(6),
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      padding: scale(16),
      borderRadius: scale(theme.borderRadius.md),
      alignItems: "center",
      marginTop: verticalScale(8),
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.textMuted,
    },
    submitButtonText: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader
        title={`${t("screenTitles.report")} ${params.type === "user" ? t("report.user") : t("report.post")}`}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <InfoSection infoMessage={t("report.description")} icon="shield-half-outline"/>

          {/* Report Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("report.sections.issue")}
            </Text>
            {REPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[styles.reportTypeContainer]}
                onPress={() => setSelectedType(type.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.reportTypeButton,
                    selectedType === type.value &&
                      styles.reportTypeButtonSelected,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedType === type.value
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={scale(20)}
                    color={
                      selectedType === type.value
                        ? theme.colors.primary
                        : theme.colors.textMuted
                    }
                  />
                  <View style={styles.reportTypeContent}>
                    <Text style={styles.reportTypeLabel}>{type.label}</Text>
                    <Text style={styles.reportTypeDescription}>
                      {type.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reason Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("report.sections.details")}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={t("report.detailsPlaceholder")}
              placeholderTextColor={theme.colors.textMuted}
              value={reason}
              onChangeText={setReason}
              multiline
              maxLength={500}
              autoCorrect={true}
            />
            <Text style={styles.characterCount}>{reason.length}/500</Text>
          </View>

          {/* Attachment */}
          <View style={styles.attachmentSection}>
            <Text style={styles.sectionTitle}>
              {t("report.sections.evidence")}
            </Text>
            <Text style={styles.description}>
              {t("report.evidenceDescription")}
            </Text>

            {attachmentUri ? (
              <View style={styles.attachmentPreview}>
                <Image
                  source={{ uri: attachmentUri }}
                  style={styles.attachmentImage}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={scale(16)} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="camera"
                  size={scale(24)}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.attachmentButtonText}>
                  {t("report.addScreenshot")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
         <Button
          text={t("report.submitReport")}
          onPress={handleSubmit}
          disabled={!selectedType || !reason.trim() || !attachmentUri || isSubmitting}
          />
        </View>
      </ScrollView>

      <ImagePickerSheet
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
      />
    </SafeAreaView>
  );
}
