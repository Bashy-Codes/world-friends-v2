import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { Button } from "../ui/Button";

interface ConfirmationModalProps {
  visible: boolean;
  icon?: string;
  iconColor?: string;
  description: string;
  confirmButtonColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  icon,
  iconColor,
  description,
  confirmButtonColor,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(32),
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      paddingVertical: verticalScale(24),
      paddingHorizontal: scale(24),
      width: "100%",
      maxWidth: scale(320),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: verticalScale(16),
    },
    description: {
      fontSize: moderateScale(15),
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: moderateScale(20),
      marginBottom: verticalScale(24),
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      gap: scale(12),
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={styles.container}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons
                name={icon as any}
                size={scale(48)}
                color={iconColor || theme.colors.error}
              />
            </View>
          )}
          <Text style={styles.description}>{description}</Text>
          <View style={styles.buttonContainer}>
            <Button
              iconName="close"
              onPress={onCancel}
              bgColor={theme.colors.surfaceSecondary}
              style={{ flex: 1, paddingVertical: verticalScale(12), }}
            />
            <Button
              iconName="checkmark"
              onPress={onConfirm}
              bgColor={confirmButtonColor || theme.colors.error}
              style={{ flex: 1, paddingVertical: verticalScale(12), }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
