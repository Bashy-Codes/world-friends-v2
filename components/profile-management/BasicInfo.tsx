import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { calculateAge } from "@/utils/common";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useQuery } from "convex/react";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { api } from "@/convex/_generated/api";
import { ValidationContainer } from "@/components/common/ValidationContainer";

interface BasicInfoProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  onUsernameStatusChange?: (status: string | null) => void;
}

const getGenderOptions = (t: any) => [
  { id: "male", label: t("common.genders.male"), emoji: "👨" },
  { id: "female", label: t("common.genders.female"), emoji: "👩" },
  {
    id: "other",
    label: t("common.genders.other"),
    emoji: "🏳️‍⚧️",
  },
];

export const BasicInfo: React.FC<BasicInfoProps> = ({
  control,
  errors,
  onUsernameStatusChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [username, setUsername] = useState("");
  const [debouncedUsername] = useDebounce(username, 1000);


  // Get translated gender options
  const GENDER_OPTIONS = getGenderOptions(t);

  // Check username availability with debounce
  const isUsernameAvailable = useQuery(
    api.users.checkUsernameAvailability,
    debouncedUsername && debouncedUsername.length >= 3
      ? { userName: debouncedUsername }
      : "skip"
  );

  const getUsernameStatus = () => {
    if (!username || username.length < 3) return null;
    if (debouncedUsername !== username) return "checking";
    if (isUsernameAvailable === undefined) return "checking";
    return isUsernameAvailable ? "available" : "taken";
  };

  const usernameStatus = getUsernameStatus();

  // Notify parent component about username status changes
  React.useEffect(() => {
    if (onUsernameStatusChange) {
      onUsernameStatusChange(usernameStatus);
    }
  }, [usernameStatus, onUsernameStatusChange]);

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
    input: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(14),
      fontSize: moderateScale(14),
      color: theme.colors.text,
    },
    errorText: {
      fontSize: moderateScale(12),
      color: theme.colors.error,
      marginTop: verticalScale(4),
    },
    successText: {
      fontSize: moderateScale(12),
      color: theme.colors.success,
      marginTop: verticalScale(4),
    },
    genderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: scale(12),
    },
    genderOption: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: scale(theme.borderRadius.md),
      paddingVertical: verticalScale(16),
      alignItems: "center",
      justifyContent: "center",
    },
    genderOptionSelected: {
      backgroundColor: theme.colors.primary + "15",
      borderColor: theme.colors.primary,
    },
    genderEmoji: {
      fontSize: moderateScale(24),
      marginBottom: verticalScale(4),
    },
    genderText: {
      fontSize: moderateScale(13),
      fontWeight: "500",
      color: theme.colors.text,
    },
    genderTextSelected: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
    dateButton: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(14),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateText: {
      fontSize: moderateScale(14),
      color: theme.colors.text,
    },
    datePlaceholder: {
      color: theme.colors.textMuted,
    },
    usernameContainer: {
      position: "relative",
    },
    usernameStatusContainer: {
      position: "absolute",
      right: scale(16),
      top: "50%",
      transform: [{ translateY: -scale(12) }],
      zIndex: 1,
    },
    inputWithStatus: {
      paddingRight: scale(50),
    },
    ageDisplay: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: verticalScale(8),
    },
    ageText: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      marginLeft: scale(6),
    },
    ageTextRed: {
      color: theme.colors.error,
    },
    ageTextGreen: {
      color: theme.colors.success,
    },
  });

  return (
    <View style={styles.container}>
      {/* Name Input */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.name.label")}
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <ValidationContainer hasError={!!errors.name}>
              <TextInput
                style={styles.input}
                placeholder={t("createProfile.basicInfo.name.placeholder")}
                placeholderTextColor={theme.colors.textMuted}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\s+/g, ""))}
                onBlur={onBlur}
                maxLength={12}
              />
            </ValidationContainer>
          )}
        />
      </View>

      {/* Username Input */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.username.label")}
        </Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <ValidationContainer hasError={!!errors.username || usernameStatus === "taken"}>
              <View style={styles.usernameContainer}>
                <TextInput
                  style={[styles.input, styles.inputWithStatus]}
                  placeholder={t("createProfile.basicInfo.username.placeholder")}
                  placeholderTextColor={theme.colors.textMuted}
                  value={value}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/\s+/g, "");
                    onChange(cleanText);
                    setUsername(cleanText);
                  }}
                  onBlur={onBlur}
                  maxLength={12}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.usernameStatusContainer}>
                  {usernameStatus === "checking" && (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                  )}
                  {usernameStatus === "available" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={scale(20)}
                      color={theme.colors.success}
                    />
                  )}
                  {usernameStatus === "taken" && (
                    <Ionicons
                      name="close-circle"
                      size={scale(20)}
                      color={theme.colors.error}
                    />
                  )}
                </View>
              </View>
            </ValidationContainer>
          )}
        />
        {errors.username && (
          <Text style={styles.errorText}>
            {typeof errors.username.message === "string"
              ? errors.username.message
              : "Username is required"}
          </Text>
        )}
        {usernameStatus === "taken" && !errors.username && (
          <Text style={styles.errorText}>
            {t("createProfile.basicInfo.username.taken")}
          </Text>
        )}
        {usernameStatus === "available" && !errors.username && (
          <Text style={styles.successText}>
            {t("createProfile.basicInfo.username.available")}
          </Text>
        )}
      </View>

      {/* Gender Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.gender.label")}
        </Text>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <ValidationContainer hasError={!!errors.gender}>
              <View style={styles.genderContainer}>
                {GENDER_OPTIONS.map((option) => {
                  const isSelected = value === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.genderOption,
                        isSelected && styles.genderOptionSelected,
                      ]}
                      onPress={() => onChange(option.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.genderEmoji}>
                        {option.emoji}
                      </Text>
                      <Text
                        style={[
                          styles.genderText,
                          isSelected && styles.genderTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ValidationContainer>
          )}
        />
      </View>

      {/* Birthdate Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.birthdate.label")}
        </Text>
        <Controller
          control={control}
          name="birthdate"
          render={({ field: { onChange, value } }) => (
            <>
              <ValidationContainer hasError={!!errors.birthdate}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.dateText, !value && styles.datePlaceholder]}
                  >
                    {value
                      ? value.toLocaleDateString()
                      : t("createProfile.basicInfo.birthdate.placeholder")}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={scale(20)}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </ValidationContainer>
              {showDatePicker && (
                <DateTimePicker
                  value={value || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_event, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      onChange(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1924, 0, 1)}
                />
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="birthdate"
          render={({ field: { value } }) => {
            if (!value) return <View />;

            const age = calculateAge(value);
            const isUnder13 = age < 13;

            return (
              <View style={styles.ageDisplay}>
                <Ionicons
                  name="gift"
                  size={scale(16)}
                  color={isUnder13 ? theme.colors.error : theme.colors.success}
                />
                <Text
                  style={[
                    styles.ageText,
                    isUnder13 ? styles.ageTextRed : styles.ageTextGreen,
                  ]}
                >
                  {age}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};
