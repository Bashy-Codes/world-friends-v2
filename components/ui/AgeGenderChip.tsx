import React, { memo } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";

interface AgeGenderChipProps {
  gender: "male" | "female" | "other";
  showGenerText?: boolean,
  age: number;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

const AgeGenderChip: React.FC<AgeGenderChipProps> = ({
  gender,
  showGenerText = false,
  age,
  size = "medium",
  style
}) => {
  const theme = useTheme();

  const sizeStyles = {
    small: {
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      iconSize: moderateScale(12),
      fontSize: moderateScale(12),
      gap: scale(6),
      marginBottom: verticalScale(8),
    },
    medium: {
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      iconSize: moderateScale(16),
      fontSize: moderateScale(14),
      gap: scale(8),
      marginBottom: verticalScale(10),
    },
    large: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      iconSize: moderateScale(20),
      fontSize: moderateScale(16),
      gap: scale(10),
      marginBottom: verticalScale(12),
    },
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: sizeStyles[size].gap,
      marginBottom: sizeStyles[size].marginBottom,
    },
    genderChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        gender === "male"
          ? theme.colors.info
          : gender === "female"
          ? theme.colors.error
          : theme.colors.warning,
      borderRadius: scale(theme.borderRadius.full),
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      paddingVertical: sizeStyles[size].paddingVertical,
    },
    ageChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.info,
      borderRadius: scale(theme.borderRadius.full),
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      paddingVertical: sizeStyles[size].paddingVertical,
    },
    icon: {
      fontSize: sizeStyles[size].iconSize,
    },
    text: {
      fontSize: sizeStyles[size].fontSize,
      color: theme.colors.white,
      fontWeight: "600",
      marginLeft: scale(4),
    },
  });

  const genderIcon = gender === "female" ? "👩" : gender === "male" ? "👨" : "👤";
  const genderText = gender === "female" ? "Female" : gender === "male" ? "Male" : "Other";

  return (
    <View style={[styles.container, style]}>
      <View style={styles.genderChip}>
        <Text style={styles.icon}>{genderIcon}</Text>
        {showGenerText &&  <Text style={styles.text}>{genderText}</Text>}
       
      </View>
      <View style={styles.ageChip}>
        <Text style={styles.icon}>🎂</Text>
        <Text style={styles.text}>{age}</Text>
      </View>
    </View>
  );
};

export default memo(AgeGenderChip);