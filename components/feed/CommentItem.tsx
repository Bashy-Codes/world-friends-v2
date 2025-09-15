import React, { useState, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet  } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { formatTimeAgo } from "@/utils/formatTime";
import { Id } from "@/convex/_generated/dataModel";
import { CommentTypes } from "@/types/feed";

export interface CommentItemProps {
  comment: CommentTypes;
  onDeletePress: (commentId: Id<"comments">) => void;
  onReplyPress: (comment: CommentTypes) => void;
}

export const CommentItem: React.FC<CommentItemProps> = memo(({
  comment,
  onDeletePress,
  onReplyPress,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isReplyExpanded, setIsReplyExpanded] = useState(false);

  const handleToggleReply = () => {
    setIsReplyExpanded(!isReplyExpanded);
  };

  const handleReply = () => {
    onReplyPress(comment);
  };

  const handleDelete = () => {
    onDeletePress(comment.commentId);
  };

  const handleDeleteReply = () => {
    if (comment.reply) {
      onDeletePress(comment.reply.commentId);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginVertical: verticalScale(6),
      borderRadius: moderateScale(16),
      padding: scale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    profileImage: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      marginRight: scale(12),
    },
    userInfo: {
      flex: 1,
    },
    userNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(2),
    },
    userName: {
      fontSize: moderateScale(15),
      fontWeight: "600",
      color: theme.colors.text,
    },
    verifiedIcon: {
      marginLeft: scale(5),
    },
    supporterIcon: {
      marginLeft: scale(5),
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    timeText: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
    },
    commentText: {
      fontSize: moderateScale(14),
      lineHeight: moderateScale(20),
      color: theme.colors.text,
      marginBottom: verticalScale(4),
    },
    deleteButton: {
      padding: scale(8),
      borderRadius: moderateScale(20),
      backgroundColor: theme.colors.background,
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: verticalScale(8),
      gap: scale(16),
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    actionText: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
      fontWeight: "500",
    },
    replyContainer: {
      marginTop: verticalScale(12),
      marginLeft: scale(20),
      position: "relative",
    },
    replyLinkLine: {
      position: "absolute",
      left: scale(-15),
      top: scale(-8),
      width: scale(15),
      height: scale(20),
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      borderColor: theme.colors.primary + "60",
      borderBottomLeftRadius: scale(8),
    },
    replyItem: {
      backgroundColor: theme.colors.background,
      borderRadius: moderateScale(12),
      padding: scale(12),
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary + "40",
    },
    replyHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(8),
    },
    replyProfileImage: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      marginRight: scale(8),
    },
    replyUserInfo: {
      flex: 1,
    },
    replyUserName: {
      fontSize: moderateScale(13),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: verticalScale(1),
    },
    replyTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    replyTimeText: {
      fontSize: moderateScale(11),
      color: theme.colors.textMuted,
    },
    replyText: {
      fontSize: moderateScale(13),
      lineHeight: moderateScale(18),
      color: theme.colors.text,
    },
    replyDeleteButton: {
      padding: scale(4),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: comment.commentAuthor.profilePicture }}
          style={styles.profileImage}
          contentFit="cover"
          priority="normal"
          cachePolicy={"memory"}
          placeholder={"@/assets/images/user.png"}
          placeholderContentFit="scale-down"
        />
        <View style={styles.userInfo}>
          <View style={styles.userNameContainer}>
            <Text style={styles.userName} numberOfLines={1}>
              {comment.commentAuthor.name}
            </Text>
            {comment.commentAuthor.isAdmin && (
              <Ionicons
                name="shield-checkmark"
                size={scale(16)}
                color={theme.colors.primary}
                style={styles.verifiedIcon}
              />
            )}
            {comment.commentAuthor.isSupporter && (
              <Ionicons
                name="heart"
                size={scale(16)}
                color={theme.colors.secondary}
                style={styles.supporterIcon}
              />
            )}
          </View>
          <View style={styles.timeContainer}>
            <Ionicons
              name="time"
              size={scale(12)}
              color={theme.colors.success}
            />
            <Text style={styles.timeText}>
              {formatTimeAgo(comment.createdAt)}
            </Text>
          </View>
        </View>
        {comment.isOwner && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={scale(16)}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        )}
      </View>
  
      <Text style={styles.commentText} selectable={true}>{comment.content}</Text>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {comment.hasReply ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleReply}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isReplyExpanded ? "remove" : "add"}
              size={scale(14)}
              color={theme.colors.textMuted}
            />
            <Text style={styles.actionText}>
              {isReplyExpanded
                ? t("comments.hideReply")
                : t("comments.showReply")}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReply}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-undo"
              size={scale(14)}
              color={theme.colors.textMuted}
            />
            <Text style={styles.actionText}>{t("comments.reply")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reply section */}
      {comment.hasReply && comment.reply && isReplyExpanded && (
        <View style={styles.replyContainer}>
          <View style={styles.replyLinkLine} />
          <View style={styles.replyItem}>
            <View style={styles.replyHeader}>
              <Image
                source={comment.reply.commentAuthor.profilePicture || undefined}
                style={styles.replyProfileImage}
              />
              <View style={styles.replyUserInfo}>
                <Text style={styles.replyUserName} numberOfLines={1}>
                  {comment.reply.commentAuthor.name}
                </Text>
                <View style={styles.replyTimeContainer}>
                  <Ionicons
                    name="time"
                    size={scale(10)}
                    color={theme.colors.success}
                  />
                  <Text style={styles.replyTimeText}>
                    {formatTimeAgo(comment.reply.createdAt)}
                  </Text>
                </View>
              </View>
              {comment.reply.isOwner && (
                <TouchableOpacity
                  style={styles.replyDeleteButton}
                  onPress={handleDeleteReply}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={scale(14)}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.replyText}>{comment.reply.content}</Text>
          </View>
        </View>
      )}
    </View>
  );
});

CommentItem.displayName = "CommentItem";
