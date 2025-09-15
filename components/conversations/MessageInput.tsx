import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { MessageData } from "@/types/conversations";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { uploadImageToConvex } from "@/utils/uploadImages";
import { ImagePickerSheet, ImagePickerSheetRef } from "@/components/common/ImagePickerSheet";
import { LoadingModal } from "@/components/common/LoadingModal";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendImage: (imageId: Id<"_storage">) => void;
  replyingTo: MessageData | null;
  onCancelReply: () => void;
  isSending: boolean;
  messagePlaceholder: string;
}

/**
 * MessageInput component for typing and sending messages
 *
 * Features:
 * - Text input with send button
 * - Image picker integration
 * - Reply functionality with preview
 * - Cancel reply option
 * - Loading states
 * - Proper keyboard handling
 */

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendImage,
  replyingTo,
  onCancelReply,
  isSending,
  messagePlaceholder,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imagePickerRef = useRef<ImagePickerSheetRef>(null);

  // Upload image mutation
  const generateUploadUrl = useMutation(api.storage.generateConvexUploadUrl);

  // Get reply preview content
  const getReplyPreview = () => {
    if (!replyingTo) return "";

    if (replyingTo.type === "image") {
      return "📷";
    }

    return replyingTo.content || "Message";
  };

  const handleImagePress = () => {
    // dismiss keyboard
    Keyboard.dismiss();
    imagePickerRef.current?.present();
  };

  // Handle send message
  const handleSend = () => {
    if (!message.trim() || isSending) return;

    onSendMessage(message);
    setMessage("");
  };

  // Handle image selection
  const handleImageSelected = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);

      // Upload image using utility
      const result = await uploadImageToConvex(imageUri, generateUploadUrl);

      if (!result?.storageId) {
        throw new Error("Failed to upload image");
      }

      // Send image message
      onSendImage(
        result.storageId as Id<"_storage">
      );
      setMessage("");
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

   const styles =  StyleSheet.create({
        container: {
          backgroundColor: theme.colors.surface,
          paddingHorizontal: scale(16),
          paddingTop: verticalScale(12),
          paddingBottom: insets.bottom + verticalScale(12),
          borderTopLeftRadius: scale(theme.borderRadius.xl),
          borderTopRightRadius: scale(theme.borderRadius.xl),
        },
        replyContainer: {
          backgroundColor: theme.colors.background,
          borderRadius: scale(theme.borderRadius.md),
          padding: scale(12),
          marginBottom: verticalScale(8),
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.primary,
        },
        replyHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: verticalScale(4),
        },
        replyAuthorRow: {
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        },
        cancelButton: {
          padding: scale(4),
        },
        replyAuthor: {
          fontSize: moderateScale(12),
          fontWeight: "500",
          color: theme.colors.text,
          marginBottom: verticalScale(2),
        },
        replyContent: {
          fontSize: moderateScale(12),
          color: theme.colors.textSecondary,
          fontStyle: "italic",
          fontFamily: "monospace",
        },
        inputRow: {
          flexDirection: "row",
          alignItems: "flex-end",
          gap: scale(8),
        },
        inputContainer: {
          flex: 1,
          backgroundColor: theme.colors.background,
          borderRadius: scale(theme.borderRadius.xl),
          paddingHorizontal: scale(16),
          paddingVertical: scale(8),
          minHeight: scale(44),
        },
        textInput: {
          fontSize: moderateScale(16),
          color: theme.colors.text,
          maxHeight: scale(100),
          paddingVertical: scale(4),
        },
        imageButton: {
          width: scale(44),
          height: scale(44),
          borderRadius: scale(theme.borderRadius.full),
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        },
        sendButton: {
          width: scale(44),
          height: scale(44),
          borderRadius: scale(theme.borderRadius.full),
          backgroundColor: message.trim()
            ? theme.colors.primary
            : theme.colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
      });

  return (
    <>
      <View style={styles.container}>
        {/* Reply Preview */}
        {replyingTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyHeader}>
              <View style={styles.replyAuthorRow}>
                <Text style={styles.replyAuthor}>
                  ↪️ {replyingTo.sender.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancelReply}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={scale(16)}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.replyContent} numberOfLines={1}>
              {getReplyPreview()}
            </Text>
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          {/* Image Button */}
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleImagePress}
            activeOpacity={0.7}
            disabled={isSending}
          >
            <Ionicons
              name="camera"
              size={scale(20)}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={messagePlaceholder}
              placeholderTextColor={theme.colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="center"
              autoCorrect={true}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!message.trim() || isSending}
          >
            <Ionicons
              name="send"
              size={scale(18)}
              color={
                message.trim() ? theme.colors.white : theme.colors.textMuted
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Picker Sheet */}
      <ImagePickerSheet
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
      />

      {/* Loading Modal for Image Upload */}
      <LoadingModal
        visible={isUploadingImage}
        state="loading"
      />
    </>
  );
};
