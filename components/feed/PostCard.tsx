import React, { memo, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet,  Dimensions} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { formatTimeAgo } from "@/utils/formatTime";
import { PostCardProps } from "@/types/feed";
import { Id } from "@/convex/_generated/dataModel";
import { Separator } from "@/components/common/Separator";
import { AddReactionModal } from "./AddReactionModal";
import { PostMeta } from "./PostMeta";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PostCardComponent: React.FC<PostCardProps> = ({
  post,
  onReaction,
  onComment,
  onImagePress,
  onReadMore,
  onReactionsPress,
  onUserPress,
  onOptionsPress,
  showFullText = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showAddReactionModal, setShowAddReactionModal] = useState(false);

  const handleReaction = useCallback((postId: Id<"posts">, emoji: string) => {
    onReaction(postId, emoji);
  }, [onReaction]);

  const handleReactionsPress = useCallback(() => {
    onReactionsPress(post.postId);
  }, [post.postId, onReactionsPress]);

  const handleReactionButtonPress = useCallback(() => {
    setShowAddReactionModal(true);
  }, []);

  const handleCommentPress = useCallback(() => {
    onComment(post.postId);
  }, [post.postId, onComment]);

  const closeAddReactionModal = useCallback(() => {
    setShowAddReactionModal(false);
  }, []);



  const handleComment = useCallback(() => {
    onComment(post.postId);
  }, [post.postId, onComment]);

  const handleUserPress = useCallback(() => {
    onUserPress?.(post.postAuthor.userId, post.isOwner, post.postAuthor.isAdmin || false);
  }, [post.postAuthor.userId, post.isOwner, post.postAuthor.isAdmin, onUserPress]);

  const handleOptionsPress = useCallback(() => {
    onOptionsPress?.(post);
  }, [post, onOptionsPress]);

  const handleReadMore = useCallback(() => {
    onReadMore(post.postId);
  }, [post.postId, onReadMore]);

  const handleImagePress = useCallback(() => {
    if (post.postImages && post.postImages.length > 0) {
      onImagePress?.(post.postImages, 0);
    }
  }, [post.postImages, onImagePress]);

  const showReadMore = !showFullText && post.content.length > 100;
  const displayContent = showReadMore
    ? post.content.substring(0, 100).replace(/\n/g, " ")
    : post.content.replace(/\n/g, " ");

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      width: SCREEN_WIDTH,
      marginBottom: verticalScale(1),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
    },
    userSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    profilePicture: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(theme.borderRadius.full),
      marginRight: scale(12),
      borderWidth: scale(2),
      borderColor: theme.colors.primary
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
      fontSize: moderateScale(16),
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
      gap: 4,
    },
    timeText: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
    },
    moreButton: {
      padding: scale(8),
    },
    content: {
      paddingHorizontal: scale(16),
      marginBottom: verticalScale(12),
    },
    contentText: {
      fontSize: moderateScale(15),
      color: theme.colors.text,
      lineHeight: moderateScale(20),
    },
    readMoreText: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
    imagesContainer: {
      marginBottom: verticalScale(12),
      alignItems: "center",
      height: verticalScale(300),
      position: "relative",
    },
    postImage: {
      width: "100%",
      height: "100%",
    },
    imageDotsContainer: {
      position: "absolute",
      bottom: verticalScale(8),
      alignSelf: "center",
      flexDirection: "row",
      gap: scale(4),
    },
    imageDot: {
      width: scale(6),
      height: scale(6),
      borderRadius: scale(3),
      backgroundColor: "rgba(255, 255, 255, 0.7)",
    },

    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: scale(20),
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userSection}
          onPress={handleUserPress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: post.postAuthor.profilePicture }}
            style={styles.profilePicture}
            contentFit="cover"
            priority="normal"
            cachePolicy={"memory"}
            placeholder={"@/assets/images/user.png"}
            placeholderContentFit="scale-down"
                 />
          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{post.postAuthor.name}</Text>
              {post.postAuthor.isAdmin && (
                <Ionicons
                  name="shield-checkmark"
                  size={scale(16)}
                  color={theme.colors.primary}
                  style={styles.verifiedIcon}
                />
              )}
              {post.postAuthor.isSupporter && (
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
                {formatTimeAgo(post.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* Show ellipsis button only if not admin post */}
        {!post.postAuthor.isAdmin && onOptionsPress && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleOptionsPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={scale(20)}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.contentText} selectable={true}>
          {displayContent}
          {showReadMore && (
            <Text style={styles.readMoreText} onPress={handleReadMore}>
              {"..."}
            </Text>
          )}
        </Text>
      </View>
      {/* Images */}
      {post.postImages && post.postImages.length > 0 && (
        <>
        <Separator customOptions={["⋆｡✿ ⋆ ── ⋆ ✿｡⋆"]} />
        <TouchableOpacity style={styles.imagesContainer} onPress={handleImagePress} activeOpacity={0.9}>
          <Image
            source={{ uri: post.postImages[0] }}
            style={styles.postImage}
            contentFit="cover"
            transition={{ duration: 300, effect: "cross-dissolve" }}
            cachePolicy="memory-disk"
            placeholder={require("@/assets/images/photo.png")}
          />
          {/* Image dots indicator for multiple images */}
          {post.postImages.length > 1 && (
            <View style={styles.imageDotsContainer}>
              {post.postImages.slice(0, 3).map((_, index) => (
                <View key={index} style={styles.imageDot} />
              ))}
            </View>
          )}
        </TouchableOpacity>
          </>
      )}
      {/* Post Meta - Tags and Actions */}
      <PostMeta
        postId={post.postId}
        tags={post.tags}
        reactionsCount={post.reactionsCount}
        commentsCount={post.commentsCount}
        hasReacted={post.hasReacted}
        userReaction={post.userReaction}
        onReactionButtonPress={handleReactionButtonPress}
        onReactionsPress={handleReactionsPress}
        onCommentPress={handleCommentPress}
      />

      {/* Add Reaction Modal */}
      <AddReactionModal
        visible={showAddReactionModal}
        postId={post.postId}
        currentReaction={post.userReaction}
        onClose={closeAddReactionModal}
        onReaction={handleReaction}
      />
    </View>
  );
};

export const PostCard = memo(PostCardComponent);