import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface ButtonProps {
    onPress: () => void;
    text?: string;
    iconName?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconSize?: number;
    bgColor?: string;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    text,
    iconName,
    iconColor,
    iconSize,
    bgColor,
    disabled = false,
    style,
    textStyle,
}) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: disabled ? theme.colors.textMuted : (bgColor || theme.colors.primary) },
                disabled && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            {text && (
                <Text
                    style={[
                        styles.buttonText,
                        { color: theme.colors.text },
                        textStyle,
                    ]}
                >
                    {text}
                </Text>
            )}
            {iconName && (
                <Ionicons
                    name={iconName}
                    size={iconSize || scale(20)}
                    color={iconColor || theme.colors.text}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(16),
        paddingHorizontal: scale(24),
        borderRadius: moderateScale(24),
        gap: scale(8),
    },
    buttonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        fontSize: moderateScale(16),
        fontWeight: "600",
    },
});