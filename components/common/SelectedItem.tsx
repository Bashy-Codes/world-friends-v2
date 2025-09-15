import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";

interface SelectedItemProps {
  text: string;
  emoji?: string;
  onRemove: () => void;
}

export const SelectedItem: React.FC<SelectedItemProps> = ({
  text,
  emoji,
  onRemove,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    selectedItem: {
      backgroundColor: theme.colors.primary + "15",
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: scale(theme.borderRadius.sm),
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      flexDirection: "row",
      alignItems: "center",
    },
    selectedItemText: {
      fontSize: moderateScale(12),
      color: theme.colors.primary,
      fontWeight: "500",
      marginRight: scale(4),
    },
    removeButton: {
      marginLeft: scale(4),
    },
  });

  return (
    <View style={styles.selectedItem}>
      <Text style={styles.selectedItemText}>
        {emoji ? `${emoji} ${text}` : text}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        activeOpacity={0.7}
      >
        <Ionicons
          name="close"
          size={scale(14)}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};
