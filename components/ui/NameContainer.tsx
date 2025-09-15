import React, { memo } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";

interface NameContainerProps {
  name: string;
  isAdmin?: boolean;
  isSupporter?: boolean;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

const NameContainer: React.FC<NameContainerProps> = ({
  name,
  isAdmin = false,
  isSupporter = false,
  size = "medium",
  style
}) => {
  const theme = useTheme();

  const sizeStyles = {
    small: {
      fontSize: moderateScale(18),
      iconSize: scale(14),
      marginBottom: verticalScale(8),
    },
    medium: {
      fontSize: moderateScale(24),
      iconSize: scale(16),
      marginBottom: verticalScale(12),
    },
    large: {
      fontSize: moderateScale(30),
      iconSize: scale(20),
      marginBottom: verticalScale(12),
    },
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: sizeStyles[size].marginBottom,
    },
    name: {
      fontSize: sizeStyles[size].fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    verifiedIcon: {
      marginLeft: scale(6),
    },
    supporterIcon: {
      marginLeft: scale(4),
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.name}>{name}</Text>
      {isAdmin && (
        <Ionicons
          name="shield-checkmark"
          size={sizeStyles[size].iconSize}
          color={theme.colors.primary}
          style={styles.verifiedIcon}
        />
      )}
      {isSupporter && (
        <Ionicons
          name="heart"
          size={sizeStyles[size].iconSize}
          color={theme.colors.secondary}
          style={styles.supporterIcon}
        />
      )}
    </View>
  );
};

export default memo(NameContainer);