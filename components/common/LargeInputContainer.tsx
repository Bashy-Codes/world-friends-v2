import React from "react";
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { getCounterColor } from "@/utils/common";

interface LargeInputContainerProps extends Omit<TextInputProps, 'style'> {
  minLength?: number;
  maxLength: number;
  style?: ViewStyle;
  value: string;
}

export const LargeInputContainer: React.FC<LargeInputContainerProps> = ({
  minLength = 0,
  maxLength,
  style,
  value,
  ...textInputProps
}) => {
  const theme = useTheme();


  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(16),
      minHeight: verticalScale(200),
      position: "relative",
    },
    textInput: {
      fontSize: moderateScale(16),
      color: theme.colors.text,
      textAlignVertical: "top",
      flex: 1,
    },
    counter: {
      position: "absolute",
      bottom: scale(12),
      right: scale(12),
      fontSize: moderateScale(12),
      fontWeight: "500",
      color: getCounterColor(value?.length || 0, minLength, maxLength, theme),
    },
  });

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.textInput}
        value={value}
        multiline
        maxLength={maxLength}
        {...textInputProps}
      />
      <Text style={styles.counter}>
        {value?.length || 0}/{maxLength}
      </Text>
    </View>
  );
};
