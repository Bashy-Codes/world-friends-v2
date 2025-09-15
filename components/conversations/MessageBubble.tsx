import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { formatTimeAgo } from "@/utils/formatTime";
import { ImageViewer } from "@/components/common/ImageViewer";
import { MessageData } from "@/types/conversations";

interface MessageBubbleProps {
  message: MessageData;
  onLongPress: (message: MessageData) => void;
}

/**
 * MessageBubble component for displaying messages
 *
 * Features:
 * - Text and image message support (exclusive)
 * - Reply preview for replied messages
 * - Time ago display
 * - Different styling for own vs other messages
 * - Long press for actions
 * - Image preview with tap to view
 * - Separate image container with surface background
 */

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onLongPress,
}) => {
  const theme = useTheme();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  // Format timestamp
  const timeAgo = formatTimeAgo(message.createdAt);

  // Get reply preview content
  const getReplyPreview = () => {
    if (!message.replyParent) return null;

    const { replyParent } = message;
    if (replyParent.type === "image") {
      return "📷 Photo";
    }

    return replyParent.content || "Message";
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginVertical: verticalScale(4),
          marginHorizontal: scale(16),
          alignItems: message.isOwner ? "flex-end" : "flex-start",
        },
        bubble: {
          maxWidth: "80%",
          minWidth: "50%",
          borderRadius: scale(theme.borderRadius.lg),
          padding: scale(12),
          backgroundColor: message.isOwner
            ? theme.colors.primary
            : theme.colors.surface,
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        imageContainer: {
          maxWidth: "80%",
          borderRadius: scale(theme.borderRadius.lg),
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
          padding: scale(4), 
        },
        replyContainer: {
          backgroundColor: message.isOwner
            ? theme.colors.primaryDark + "40"
            : theme.colors.border + "60",
          borderRadius: scale(theme.borderRadius.sm),
          padding: scale(8),
          marginBottom: verticalScale(8),
          borderLeftWidth: 3,
          borderLeftColor: message.isOwner
            ? theme.colors.success
            : theme.colors.info,
        },
        replyHeader: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: verticalScale(2),
        },
        replyAuthor: {
          fontSize: moderateScale(12),
          fontWeight: "600",
          color: message.isOwner
            ? theme.colors.white + "CC"
            : theme.colors.textSecondary,
        },
        replyContent: {
          fontSize: moderateScale(12),
          color: message.isOwner
            ? theme.colors.white + "AA"
            : theme.colors.textMuted,
          fontStyle: "italic",
        },
        messageContent: {
          marginBottom: verticalScale(4),
        },
        messageText: {
          fontSize: moderateScale(16),
          color: message.isOwner ? theme.colors.white : theme.colors.text,
          lineHeight: moderateScale(22),
        },
        messageImage: {
          width: scale(200),
          height: scale(150),
          borderRadius: scale(theme.borderRadius.md),
          margin: scale(4),
        },
        timeContainer: {
          alignItems: message.isOwner ? "flex-end" : "flex-start",
          paddingHorizontal: scale(4),
          paddingBottom: scale(2),
        },
        timeText: {
          fontSize: moderateScale(11),
          color: message.isOwner
            ? theme.colors.white + "AA"
            : theme.colors.textMuted,
          fontWeight: "500",
        },
      }),
    [theme, message.isOwner]
  );

  return (
    <>
      <View style={styles.container}>
        {message.type === "image" && message.imageUrl ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onLongPress={() => onLongPress(message)}
            activeOpacity={0.8}
            delayLongPress={500}
            onPress={() => setImageViewerVisible(true)}
          >
            <Image
              source={{ uri: message.imageUrl }}
              style={styles.messageImage}
              contentFit="cover"
              priority="normal"
              placeholder={require("@/assets/images/photo.png")}
              placeholderContentFit="scale-down"
              transition={{ duration: 300, effect: "cross-dissolve" }}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{timeAgo}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bubble}
            onLongPress={() => onLongPress(message)}
            activeOpacity={0.8}
            delayLongPress={500}
          >
            {/* Reply Preview */}
            {message.replyParent && (
              <View style={styles.replyContainer}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyAuthor}>
                    {message.replyParent.sender.name}
                  </Text>
                </View>
                <Text style={styles.replyContent} numberOfLines={1}>
                  {getReplyPreview()}
                </Text>
              </View>
            )}

            {/* Message Content */}
            <View style={styles.messageContent}>
              <Text style={styles.messageText}>
                {message.content}
              </Text>
            </View>

            {/* Time */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{timeAgo}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Viewer */}
      {message.imageUrl && (
        <ImageViewer
          images={[{ uri: message.imageUrl }]}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      )}
    </>
  );
};
