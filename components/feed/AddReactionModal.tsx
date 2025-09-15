import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";


interface AddReactionModalProps {
  visible: boolean;
  postId: Id<"posts">;
  currentReaction?: string; // Current user's reaction emoji
  onClose: () => void;
  onReaction: (postId: Id<"posts">, emoji: string) => void;
}

// Predefined emojis for reactions
const REACTION_EMOJIS = [
  "❤️", "😂", "😮", "😢", "🙌", "👍", "👎", "🔥", "💯", "🎉", "😍", "🤔"
];

export const AddReactionModal: React.FC<AddReactionModalProps> = ({
  visible,
  postId,
  currentReaction,
  onClose,
  onReaction
}) => {
  const theme = useTheme();

  const handleReaction = useCallback((emoji: string) => {
    onReaction(postId, emoji);
    onClose();
  }, [postId, onReaction, onClose]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(20),
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      maxWidth: scale(320),
      width: '90%',
    },
    reactionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: scale(12),
    },
    reactionButton: {
      padding: scale(12),
      borderRadius: moderateScale(18),
      backgroundColor: theme.colors.background,
      minWidth: scale(48),
      minHeight: scale(48),
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedReactionButton: {
      backgroundColor: theme.colors.primary,
      transform: [{ scale: 1.1 }],
    },
    reactionEmoji: {
      fontSize: moderateScale(24),
      textAlign: 'center',
    },
  });

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
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.modalContainer}>
            <View style={styles.reactionsContainer}>
              {REACTION_EMOJIS.map((emoji, index) => {
                const isSelected = currentReaction === emoji;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.reactionButton,
                      isSelected && styles.selectedReactionButton
                    ]}
                    onPress={() => handleReaction(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
