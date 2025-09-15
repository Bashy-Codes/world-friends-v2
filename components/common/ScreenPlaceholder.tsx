import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { scale, verticalScale, moderateScale } from "react-native-size-matters"
import { useTheme } from "@/lib/Theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { ScreenHeader } from "../ScreenHeader"

interface ScreenPlaceholderProps {
  title: string
  icon: keyof typeof Ionicons.glyphMap;
  showButton?: boolean
  onButtonPress?: () => void
  buttonText?: string
}

export const ScreenPlaceholder: React.FC<ScreenPlaceholderProps> = ({
  title,
  icon,
  showButton = false,
  onButtonPress,
  buttonText,
}) => {
  const theme = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingHorizontal: scale(40),
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    icon: {
      marginBottom: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: "700",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: verticalScale(30),
    },
    Button: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: scale(32),
      paddingVertical: verticalScale(16),
      borderRadius: scale(theme.borderRadius.lg),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    createButtonText: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.white,
      textAlign: "center",
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader title={title} />
      <View style={styles.contentContainer}>
        <Ionicons
          name={icon}
          size={scale(64)}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>

        {showButton && onButtonPress && (
          <TouchableOpacity style={styles.Button} onPress={onButtonPress} activeOpacity={0.8}>
            <Text style={styles.createButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>

  )
}
