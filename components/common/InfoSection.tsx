import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";

interface InfoSectionProps {
  infoMessage: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  infoMessage,
  icon,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: `${theme.colors.primary}08`,
      borderRadius: scale(16),
      padding: scale(16),
      marginHorizontal: scale(6),
      marginVertical: verticalScale(12),
      borderWidth: 1,
      borderColor: `${theme.colors.primary}20`,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: scale(12),
    },
    textContainer: {
      flex: 1,
    },
    message: {
      fontSize: moderateScale(14),
      color: theme.colors.success,
      fontWeight: "500",
      lineHeight: moderateScale(20),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon || "information-circle-outline"}
            size={scale(20)}
            color={theme.colors.success}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{infoMessage}</Text>
        </View>
      </View>
    </View>
  );
};
