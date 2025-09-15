import React, { useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { type ReactionTypes } from "@/types/feed";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { formatTimeAgo } from "@/utils/formatTime";
import { ProfilePicture } from "@/components/common/TinyProfilePicture";
import { FlashList } from "@shopify/flash-list";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "../ui/Button";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ReactionsModalProps {
  visible: boolean;
  postId: Id<"posts">;
  onClose: () => void;
}

const UserItem: React.FC<{ reaction: ReactionTypes }> = ({ reaction }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(12),
      marginHorizontal: scale(16),
      marginVertical: verticalScale(4),
      borderRadius: scale(theme.borderRadius.lg),
      // shadowColor: theme.colors.shadow,
      // shadowOffset: {
      //   width: 0,
      //   height: 2,
      // },
      // shadowOpacity: 0.05,
      // shadowRadius: 4,
      // elevation: 2,
    },
    profileImage: {
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
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
      marginRight: scale(6),
    },
    timeText: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
      fontWeight: "500",
    },
    reactionContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: theme.colors.surface,
    },
    emojiText: {
      fontSize: moderateScale(18),
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ProfilePicture
        profilePicture={reaction.reactionAuthor.profilePicture || undefined}
        size={50}
        style={styles.profileImage}
      />
      <View style={styles.userInfo}>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {reaction.reactionAuthor.name}
          </Text>
          {reaction.reactionAuthor.isAdmin && (
            <Ionicons
              name="shield-checkmark"
              size={scale(16)}
              color={theme.colors.primary}
            />
          )}
          {reaction.reactionAuthor.isSupporter && (
            <Ionicons
              name="heart"
              size={scale(16)}
              color={theme.colors.secondary}
            />
          )}
        </View>
        <Text style={styles.timeText}>
          {formatTimeAgo(reaction.createdAt)}
        </Text>
      </View>
      <View style={styles.reactionContainer}>
        <Text style={styles.emojiText}>{reaction.emoji}</Text>
      </View>
    </View>
  );
};

export const ReactionsModal: React.FC<ReactionsModalProps> = ({ visible, postId, onClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Paginated query for reactions - only call when modal is visible
  const {
    results: reactions,
    status,
    loadMore,
    isLoading: loadingMore,
  } = usePaginatedQuery(
    api.feed.interactions.getPostReactions,
    visible ? { postId } : "skip",
    { initialNumItems: 20 }
  );

  const areReactionsLoading = status === "LoadingFirstPage";

  // Load more reactions
  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(20);
    }
  }, [status, loadMore]);

  const renderUserItem = useCallback(
    ({ item }: { item: ReactionTypes }) => <UserItem reaction={item} />,
    []
  );

  const renderLoader = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState style={{ flex: 1, minHeight: verticalScale(300) }} />
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.colors.surface,
      width: screenWidth * 0.9,
      height: screenHeight * 0.8,
      maxWidth: scale(500),
      maxHeight: scale(700),
      borderRadius: scale(theme.borderRadius.xl),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
      overflow: 'hidden',
    },
    actionsContainer: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
      backgroundColor: theme.colors.background,
      borderRadius: scale(theme.borderRadius.xl),
    },
    content: {
      flex: 1,
      paddingTop: verticalScale(8),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Content */}
          <View style={styles.content}>
            {areReactionsLoading ?
              renderLoader() :
              <FlashList
                data={reactions}
                keyExtractor={(item) => item.reactionId}
                renderItem={renderUserItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={{
                  paddingVertical: verticalScale(8),
                }}
              />}
          </View>
          {/* Action Button */}
          <View
            style={styles.actionsContainer}
          >
          <Button
            iconName="close"
            onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
