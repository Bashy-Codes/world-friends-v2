import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import { getTagById } from "@/constants/geographics";

// Available emojis for random selection
const AVAILABLE_EMOJIS = [
  "❤️", "😂", "😮", "😢", "🙌", "👍", "👎", "🔥", "💯", "🎉", "😍", "🤔"
];

interface PostMetaProps {
  postId: Id<"posts">;
  tags: string[];
  reactionsCount: number;
  commentsCount: number;
  hasReacted: boolean;
  userReaction?: string;
  onReactionButtonPress: () => void;
  onReactionsPress: () => void;
  onCommentPress: () => void;
}

// Internal Tags Component
const PostTags = memo<{ tags: string[] }>(({ tags }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(6),
      paddingHorizontal: scale(16),
      marginBottom: verticalScale(12),
    },
    tag: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: scale(10),
      flexDirection: "row",
      alignItems: "center",
      marginTop: verticalScale(4),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(6),
    },
    tagEmoji: {
      fontSize: moderateScale(12),
      marginRight: scale(4),
    },
    tagText: {
      fontSize: moderateScale(11),
      fontWeight: "500",
      color: theme.colors.text,
    },
  });

  if (tags.length === 0) return null;

  return (
    <View style={styles.tagsContainer}>
      {tags.map((tagId) => {
        const tag = getTagById(tagId);
        if (!tag) return null;

        return (
          <View key={tagId} style={styles.tag}>
            <Text style={styles.tagEmoji}>{tag.emoji}</Text>
            <Text style={styles.tagText}>{tag.name}</Text>
          </View>
        );
      })}
    </View>
  );
});

// Internal Reaction Button Component
const ReactionButton = memo<{
  hasReacted: boolean;
  userReaction?: string;
  onPress: () => void;
}>(({ hasReacted, userReaction, onPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    reactionButton: {
      marginRight: scale(8),
      minWidth: scale(32),
      minHeight: scale(32),
      justifyContent: "center",
      alignItems: "center",
    },
    userReactionEmoji: {
      fontSize: moderateScale(20),
      textAlign: "center",
    },
  });

  return (
    <TouchableOpacity
      style={styles.reactionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {hasReacted && userReaction ? (
        <Text style={styles.userReactionEmoji}>{userReaction}</Text>
      ) : (
        <MaterialIcons
          name="add-reaction"
          size={scale(24)}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
});

// Internal ReactionsStack Component
const ReactionsStack = memo<{
  postId: Id<"posts">;
  count: number;
  onPress: (postId: Id<"posts">) => void;
}>(({ postId, count, onPress }) => {
  const theme = useTheme();

  // Randomly select 3 emojis based on postId for consistency
  const selectedEmojis = useMemo(() => {
    // Use postId as seed for consistent random selection
    const seed = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...AVAILABLE_EMOJIS];

    // Simple seeded shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed + i) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 3);
  }, [postId]);

  const handlePress = () => {
    onPress(postId);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceSecondary,
      padding: scale(4),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      borderRadius: scale(16),
    },
    emojiStack: {
      flexDirection: "row",
      alignItems: "center",
      height: scale(28),
    },
    emojiContainer: {
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    emoji: {
      fontSize: moderateScale(14),
      textAlign: "center",
    },
    countText: {
      paddingRight: scale(8),
      fontSize: moderateScale(14),
      fontWeight: "600",
      color: theme.colors.text,
    },
  });

  if (count === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.emojiStack}>
        {selectedEmojis.map((emoji, index) => (
          <View
            key={index}
            style={[
              styles.emojiContainer,
              {
                marginLeft: index > 0 ? -scale(8) : 0, // Overlap previous emoji
                zIndex: selectedEmojis.length - index, // Stack order
              },
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        ))}
      </View>
      {count >= 100 ? (
        <Text style={styles.countText}>99+</Text>
      ) : (
        <Text style={styles.countText}>{count}</Text>)}
    </TouchableOpacity>
  );
});

// Internal Comment Button Component
const CommentButton = memo<{
  commentsCount: number;
  onPress: () => void;
}>(({ commentsCount, onPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    commentButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    commentsCount: {
      fontSize: moderateScale(14),
      color: theme.colors.textSecondary,
      marginRight: scale(6),
      fontWeight: "500",
    },
  });

  return (
    <TouchableOpacity
      style={styles.commentButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.commentsCount}>{commentsCount}</Text>
      <MaterialCommunityIcons
        name="message-reply-text-outline"
        size={scale(22)}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
});

// Main PostMeta Component
export const PostMeta = memo<PostMetaProps>(({
  postId,
  tags,
  reactionsCount,
  commentsCount,
  hasReacted,
  userReaction,
  onReactionButtonPress,
  onReactionsPress,
  onCommentPress,
}) => {
  const handleReactionsPress = useCallback(() => {
    onReactionsPress();
  }, [onReactionsPress]);

  const styles = StyleSheet.create({
    actions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(16),
      paddingBottom: verticalScale(16),
      paddingTop: verticalScale(8),
    },
    reactionsSection: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

  return (
    <>
      {/* Tags Section */}
      <PostTags tags={tags} />

      {/* Actions Section */}
      <View style={styles.actions}>
        {/* Reactions Section - Left */}
        <View style={styles.reactionsSection}>
          <ReactionButton
            hasReacted={hasReacted}
            userReaction={userReaction}
            onPress={onReactionButtonPress}
          />

          {reactionsCount > 0 && (
            <ReactionsStack
              postId={postId}
              count={reactionsCount}
              onPress={handleReactionsPress}
            />
          )}
        </View>

        {/* Comments Section - Right */}
        <CommentButton
          commentsCount={commentsCount}
          onPress={onCommentPress}
        />
      </View>
    </>
  );
});
