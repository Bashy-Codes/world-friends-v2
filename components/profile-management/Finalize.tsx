import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Image } from "expo-image";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ImagePickerSheet, ImagePickerSheetRef } from "@/components/common/ImagePickerSheet";
import { InfoSection } from "@/components/common/InfoSection";
import { calculateAge } from "@/utils/common";
import { Separator } from "@/components/common/Separator";

interface FinalizeProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  userData?: {
    birthdate?: Date;
    gender?: string;
  };
}

export const Finalize: React.FC<FinalizeProps> = ({
  control,
  errors,
  userData,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const imagePickerSheetRef = useRef<ImagePickerSheetRef>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const getGenderPreferenceMessage = () => {
    return t("createProfile.finalize.safetyInfo.genderPreference");
  };

  const getAgeRestrictionMessage = () => {
    return t("createProfile.finalize.safetyInfo.ageRestriction");
  };

  const shouldShowAgeRestriction = () => {
    const age = userData?.birthdate ? calculateAge(userData.birthdate) : null;
    return age !== null && age < 18;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: scale(20),
    },
    section: {
      marginBottom: verticalScale(24),
    },
    label: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: verticalScale(8),
    },
    description: {
      fontSize: moderateScale(13),
      color: theme.colors.textSecondary,
      marginBottom: verticalScale(12),
      lineHeight: moderateScale(14),
    },
    profilePictureContainer: {
      alignItems: "center",
      marginBottom: verticalScale(16),
    },
    profilePictureButton: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(12),
    },
    profilePictureButtonError: {
      borderColor: theme.colors.error,
    },
    profilePictureButtonSelected: {
      borderColor: theme.colors.primary,
      borderStyle: "solid",
    },
    profilePicture: {
      width: scale(116),
      height: scale(116),
      borderRadius: scale(58),
    },
    profilePictureIcon: {
      marginBottom: verticalScale(8),
    },
    profilePictureText: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
      textAlign: "center",
      fontWeight: "500",
    },
    changePhotoButton: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      backgroundColor: theme.colors.primary + "15",
      borderRadius: scale(theme.borderRadius.md),
    },
    changePhotoText: {
      fontSize: moderateScale(12),
      color: theme.colors.primary,
      fontWeight: "600",
    },
    toggleContainer: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: scale(theme.borderRadius.md),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(16),
    },
    toggleHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: verticalScale(8),
    },
    toggleTitle: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
      marginRight: scale(12),
    },
    toggleDescription: {
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
      lineHeight: moderateScale(18),
    },
    toggleContainerActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "08",
    },
    toggleTitleContainer: {
      flex: 1,
      marginRight: scale(12),
    },
    statusIndicator: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: verticalScale(4),
    },
    statusEnabled: {
      backgroundColor: theme.colors.success + "15",
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      borderRadius: scale(12),
    },
    statusDisabled: {
      backgroundColor: theme.colors.error + "15",
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      borderRadius: scale(12),
    },
    statusText: {
      fontSize: moderateScale(11),
      fontWeight: "600",
      marginLeft: scale(4),
    },
    statusTextEnabled: {
      color: theme.colors.success,
    },
    statusTextDisabled: {
      color: theme.colors.error,
    },
    finishSection: {
      alignItems: "center",
      paddingVertical: verticalScale(20),
    },
    finishIcon: {
      marginBottom: verticalScale(16),
    },
    finishTitle: {
      fontSize: moderateScale(26),
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
  });

  const handleImageSelected = (imageUri: string) => {
    setSelectedImageUri(imageUri);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.section}>
        <View style={styles.finishSection}>
          <Ionicons
            name="checkmark-circle"
            size={scale(76)}
            color={theme.colors.success}
            style={styles.finishIcon}
          />
          <Text style={styles.finishTitle}>
            {t("createProfile.finalize.finalizeTitle")}
          </Text>
        </View>
      </View>
      {/* Age Restriction Information (only for users under 18) */}
      {shouldShowAgeRestriction() && (
        <InfoSection infoMessage={getAgeRestrictionMessage()} />
      )}
      <Separator customOptions={["☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽"]} />
      {/* Profile Picture Section */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.finalize.profilePicture.label")}
        </Text>
        <Text style={styles.description}>
          {t("createProfile.finalize.profilePicture.description")}
        </Text>
        <Controller
          control={control}
          name="profilePicture"
          render={({ field: { onChange, value } }) => (
            <View style={styles.profilePictureContainer}>
              <TouchableOpacity
                style={[
                  styles.profilePictureButton,
                  errors.profilePicture && styles.profilePictureButtonError,
                  (selectedImageUri || value) &&
                    styles.profilePictureButtonSelected,
                ]}
                onPress={() => imagePickerSheetRef.current?.present()}
                activeOpacity={0.7}
              >
                {selectedImageUri || value ? (
                  <Image
                    source={{ uri: selectedImageUri || value }}
                    style={styles.profilePicture}
                    contentFit="cover"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="camera"
                      size={scale(32)}
                      color={theme.colors.textMuted}
                      style={styles.profilePictureIcon}
                    />
                    <Text style={styles.profilePictureText}>
                      {t("createProfile.finalize.profilePicture.addPhoto")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {(selectedImageUri || value) && (
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={() => imagePickerSheetRef.current?.present()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changePhotoText}>
                    {t("createProfile.finalize.profilePicture.changePhoto")}
                  </Text>
                </TouchableOpacity>
              )}
              <ImagePickerSheet
                ref={imagePickerSheetRef}
                onImageSelected={(imageUri) => {
                  handleImageSelected(imageUri);
                  onChange(imageUri);
                }}
              />
            </View>
          )}
        />
      </View>
      <Separator customOptions={["☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽"]} />
      {/* Gender Preference Safety Information */}
      <InfoSection infoMessage={getGenderPreferenceMessage()} />
      {/* Gender Preference Toggle */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.finalize.genderPreference.label")}
        </Text>
        <Controller
          control={control}
          name="genderPreference"
          render={({ field: { onChange, value } }) => (
            <View
              style={[
                styles.toggleContainer,
                value && styles.toggleContainerActive,
              ]}
            >
              <View style={styles.toggleHeader}>
                <View style={styles.toggleTitleContainer}>
                  <Text style={styles.toggleTitle}>
                    {t("createProfile.finalize.genderPreference.label")}
                  </Text>
                  <View
                    style={[
                      styles.statusIndicator,
                      value ? styles.statusEnabled : styles.statusDisabled,
                    ]}
                  >
                    <Ionicons
                      name={value ? "checkmark-circle" : "close-circle"}
                      size={scale(16)}
                      color={value ? theme.colors.success : theme.colors.error}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        value
                          ? styles.statusTextEnabled
                          : styles.statusTextDisabled,
                      ]}
                    >
                      {value
                        ? t("createProfile.finalize.genderPreference.enabled")
                        : t("createProfile.finalize.genderPreference.disabled")}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary + "40",
                  }}
                  thumbColor={
                    value ? theme.colors.primary : theme.colors.textMuted
                  }
                />
              </View>
              <Text style={styles.toggleDescription}>
                {value
                  ? t(
                      "createProfile.finalize.genderPreference.descriptionEnabled"
                    )
                  : t(
                      "createProfile.finalize.genderPreference.descriptionDisabled"
                    )}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};
