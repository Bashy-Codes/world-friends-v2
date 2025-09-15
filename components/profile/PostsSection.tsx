import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import { usePosts } from "@/hooks/profile/usePosts";
import type { PostTypes } from "@/types/feed";

// Components
import { ReactionsModal } from "@/components/feed/ReactionsModal";
import { ActionSheet } from "@/components/common/ActionSheet";
import { CollectionsModal } from "@/components/feed/CollectionsModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ImageViewer } from "@/components/common/ImageViewer";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/EmptyState";


interface PostsSectionProps {
  // User context
  userId: Id<"users">;
  isFriend?: boolean;
}

export const PostsSection: React.FC<PostsSectionProps> = ({
  userId,
  isFriend = true,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Use the posts hook
  const {
    posts,
    loading,
    handleReaction,
    handleComment,
    handleReactionsPress,
    handleImagePress,
    handleReadMore,
    handleUserPress,
    handlePostOptionsPress,
    handleLoadMore,
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet,
    renderCollectionsModal,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  } = usePosts({
    targetUserId: userId,
    skip: !isFriend,
  });

  const renderPost = useCallback(
    ({ item }: { item: PostTypes }) => (
      <PostCard
        post={item}
        onReaction={handleReaction}
        onComment={handleComment}
        onImagePress={handleImagePress}
        onReadMore={handleReadMore}
        onReactionsPress={handleReactionsPress}
        onUserPress={handleUserPress}
        onOptionsPress={handlePostOptionsPress}
      />
    ),
    [
      handleReaction,
      handleComment,
      handleImagePress,
      handleReadMore,
      handleReactionsPress,
      handleUserPress,
      handlePostOptionsPress,
    ]
  );

    const ReactionsComponent = (() => {
      const reactionsProps = renderReactionsModal();
      return reactionsProps ? (
        <ReactionsModal
          visible={reactionsProps.visible}
          postId={reactionsProps.postId}
          onClose={reactionsProps.onClose}
        />
      ) : null;
    })();

    const ActionsComponent = (() => {
      const actionProps = renderActionSheet();
      return actionProps ? (
        <ActionSheet ref={actionProps.ref} options={actionProps.options} />
      ) : null;
    })();

    const CollectionsComponent = (() => {
      const collectionsProps = renderCollectionsModal();
      return (
        <CollectionsModal ref={collectionsProps.ref}
          onCollectionSelect={collectionsProps.onCollectionSelect}
        />
        );
      })();


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: verticalScale(40),
    },
    restrictedContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(40),
      paddingVertical: verticalScale(40),
    },
    restrictedText: {
      fontSize: moderateScale(16),
      fontWeight: "500",
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: verticalScale(12),
    },
  });

  if (!isFriend) {
    return (
      <View style={styles.restrictedContainer}>
        <Ionicons
          name="lock-closed"
          size={scale(48)}
          color={theme.colors.textMuted}
        />
        <Text style={styles.restrictedText}>{t("profile.restriction.posts")}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.postId}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: verticalScale(32),
        }}
        ListEmptyComponent={() => (
          <EmptyState style={{ flex: 1, minHeight: verticalScale(300) }} />
        )}
      />

      {/* Sheets and Modals */}
      {ReactionsComponent}
      {ActionsComponent}
      {CollectionsComponent}
      <ImageViewer {...renderImageViewer()} />     
      <ConfirmationModal {...renderDeleteConfirmationModal()} />
      <ConfirmationModal {...renderRemoveConfirmationModal()} />
    </View>
  );
};
