import React, { useState, useCallback, memo } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { CommentTypes } from "@/types/feed";

export interface CommentInputProps {
  onSubmitComment: (text: string) => void;
  replyToComment?: CommentTypes | null;
  onCancelReply?: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = memo(({
  onSubmitComment,
  replyToComment,
  onCancelReply,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = useCallback(() => {
    if (commentText.trim()) {
      onSubmitComment(commentText.trim());
      setCommentText("");
    }
  }, [commentText, onSubmitComment]);

  const handleCancelReply = useCallback(() => {
    if (onCancelReply) {
      onCancelReply();
    }
  }, [onCancelReply]);

  const isSubmitDisabled = !commentText.trim();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(12),
      paddingBottom: insets.bottom + verticalScale(12),
      borderTopLeftRadius: scale(theme.borderRadius.xl),
      borderTopRightRadius: scale(theme.borderRadius.xl),
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: theme.colors.background,
      borderRadius: moderateScale(22),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      minHeight: verticalScale(44),
    },
    textInput: {
      flex: 1,
      fontSize: moderateScale(16),
      lineHeight: moderateScale(20),
      color: theme.colors.text,
      maxHeight: verticalScale(250),
      paddingVertical: verticalScale(8),
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: moderateScale(18),
      width: scale(36),
      height: scale(36),
      justifyContent: "center",
      alignItems: "center",
      marginLeft: scale(6),
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.textMuted,
      opacity: 0.5,
    },
    replyPreviewContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: moderateScale(12),
      padding: scale(12),
      marginBottom: verticalScale(8),
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    replyPreviewContent: {
      flex: 1,
      marginRight: scale(8),
    },
    replyPreviewTitle: {
      fontSize: moderateScale(12),
      fontWeight: "600",
      color: theme.colors.primary,
      marginBottom: verticalScale(2),
    },
    replyPreviewText: {
      fontSize: moderateScale(13),
      color: theme.colors.textMuted,
      fontStyle: "italic",
    },
    replyPreviewCloseButton: {
      padding: scale(4),
    },
  });

  return (
    <View style={styles.container}>
      {/* Reply Preview */}
      {replyToComment && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewTitle}>
              {t("comments.replyingTo")} {replyToComment.commentAuthor.name}
            </Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {replyToComment.content}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.replyPreviewCloseButton}
            onPress={handleCancelReply}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={scale(16)}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder={t("comments.addComment")}
          placeholderTextColor={theme.colors.textMuted}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          maxLength={1000}
          autoCorrect={true}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            isSubmitDisabled && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={isSubmitDisabled}
        >
          <Ionicons
            name="send"
            size={scale(16)}
            color={theme.colors.surface}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

CommentInput.displayName = "CommentInput";
