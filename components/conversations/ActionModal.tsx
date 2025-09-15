import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { MessageData } from "@/types/conversations";
import { useTranslation } from "react-i18next";


interface ActionModalProps {
  visible: boolean;
  message: MessageData | null;
  onReply: (message: MessageData) => void;
  onDelete: (message: MessageData) => void;
  onClose: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  message,
  onReply,
  onDelete,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();


  const styles = StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: scale(32),
        },
        container: {
          backgroundColor: theme.colors.surface,
          borderRadius: scale(theme.borderRadius.xl),
          paddingVertical: verticalScale(24),
          paddingHorizontal: scale(20),
          width: "100%",
          maxWidth: scale(300),
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
        },
        actionsContainer: {
          gap: verticalScale(12),
        },
        actionButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: verticalScale(16),
          paddingHorizontal: scale(16),
          borderRadius: scale(theme.borderRadius.md),
          backgroundColor: theme.colors.background,
        },
        deleteButton: {
          backgroundColor: theme.colors.error + "15",
        },
        actionIcon: {
          width: scale(40),
          height: scale(40),
          borderRadius: scale(theme.borderRadius.full),
          alignItems: "center",
          justifyContent: "center",
          marginRight: scale(16),
        },
        replyIcon: {
          backgroundColor: theme.colors.primary + "15",
        },
        deleteIcon: {
          backgroundColor: theme.colors.error + "15",
        },
        actionContent: {
          flex: 1,
        },
        actionTitle: {
          fontSize: moderateScale(16),
          fontWeight: "600",
        },
        replyTitle: {
          color: theme.colors.text,
        },
        deleteTitle: {
          color: theme.colors.error,
        },
      })

  // Handle reply action
  const handleReply = () => {
    if (message) {
      onReply(message);
      onClose();
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (message) {
      onDelete(message);
      onClose();
    }
  };

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={() => {}} 
        >
          {/* Actions */}
          <View style={styles.actionsContainer}>
            {/* Reply Action */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReply}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, styles.replyIcon]}>
                <Ionicons
                  name="arrow-undo"
                  size={scale(20)}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.replyTitle]}>
                  {t("common.reply")}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Delete Action - Only for own messages */}
            {message.isOwner && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, styles.deleteIcon]}>
                  <Ionicons
                    name="trash"
                    size={scale(20)}
                    color={theme.colors.error}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, styles.deleteTitle]}>
                    {t("actions.deleteMessage")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
