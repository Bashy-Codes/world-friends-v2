import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { ValidationContainer } from "./ValidationContainer";

interface ItemSelectorProps {
  placeholder: string;
  hasError?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  children?: React.ReactNode; // For selected items display
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  placeholder,
  hasError = false,
  onPress,
  style,
  children,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(14),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    buttonText: {
      fontSize: moderateScale(14),
      color: theme.colors.textMuted,
    },
    selectedItemsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: verticalScale(8),
      gap: scale(8),
    },
  });

  return (
    <View style={style}>
      <ValidationContainer hasError={hasError}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{placeholder}</Text>
          <Ionicons
            name="chevron-down"
            size={scale(20)}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      </ValidationContainer>
      {children && (
        <View style={styles.selectedItemsContainer}>
          {children}
        </View>
      )}
    </View>
  );
};
