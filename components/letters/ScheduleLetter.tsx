import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { useTranslation } from "react-i18next";

interface ScheduleLetterProps {
  scheduleDays: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minDays: number;
  maxDays: number;
  getScheduleText: () => string;
}

export const ScheduleLetter: React.FC<ScheduleLetterProps> = ({
  scheduleDays,
  onIncrease,
  onDecrease,
  minDays,
  maxDays,
  getScheduleText,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const canDecrease = scheduleDays > minDays;
  const canIncrease = scheduleDays < maxDays;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(16),
      marginVertical: verticalScale(8),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(16),
    },
    icon: {
      marginRight: scale(8),
    },
    title: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    content: {
      alignItems: "center",
      justifyContent: "center",
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
    },
    controlButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(theme.borderRadius.full),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    controlButtonDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
    },
    daysContainer: {
      minWidth: scale(60),
      alignItems: "center",
      marginHorizontal: scale(16),
    },
    daysText: {
      fontSize: moderateScale(26),
      fontWeight: "700",
      color: theme.colors.text,
    },
    deliveryText: {
      fontSize: moderateScale(14),
      color: theme.colors.textMuted,
      marginTop: verticalScale(16),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="time-outline"
          size={scale(26)}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <Text style={styles.title}>{t("composeLetter.schedule")}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              !canDecrease && styles.controlButtonDisabled,
            ]}
            onPress={onDecrease}
            disabled={!canDecrease}
            activeOpacity={0.7}
          >
            <Ionicons
              name="remove"
              size={scale(20)}
              color={canDecrease ? theme.colors.white : theme.colors.textMuted}
            />
          </TouchableOpacity>

          <View style={styles.daysContainer}>
            <Text style={styles.daysText}>{scheduleDays}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.controlButton,
              !canIncrease && styles.controlButtonDisabled,
            ]}
            onPress={onIncrease}
            disabled={!canIncrease}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add"
              size={scale(20)}
              color={canIncrease ? theme.colors.white : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.deliveryText}>
          {t("composeLetter.deliveryTimeInfo")} {getScheduleText().toLowerCase()}
        </Text>
      </View>
    </View>
  );
};
