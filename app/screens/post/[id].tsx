import React from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/Theme";
import { usePost } from "@/hooks/feed/usePost";
import { useComments } from "@/hooks/feed/useComments";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";

// UI components
import { ScreenHeader } from "@/components/ScreenHeader";
import { ScreenLoading } from "@/components/ScreenLoading";
import { KeyboardHandler } from "@/components/common/KeyboardHandler";
import { ReactionsModal } from "@/components/feed/ReactionsModal";
import { ActionSheet } from "@/components/common/ActionSheet";
import { CollectionsModal } from "@/components/feed/CollectionsModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ImageViewer } from "@/components/common/ImageViewer";
import { PostCard } from "@/components/feed/PostCard";
import { CommentInput } from "@/components/feed/CommentInput";
import { CommentItem } from "@/components/feed/CommentItem";
import {Separator} from "@/components/common/Separator";
import { EmptyState } from "@/components/EmptyState";

export default function PostScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  // Convert string ID to Convex ID
  const postId = id as Id<"posts">;

  // Use the post hook
  const {
    post,
    loading,
    handleReaction,
    handleReactionsPress,
    handleImagePress,
    handleUserPress,
    handlePostOptionsPress,
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet,
    renderCollectionsModal,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  } = usePost(postId);

  // Use the comments hook
  const {
    comments,
    isLoadingComments,
    replyToComment,
    showDeleteModal,
    handleLoadMoreComments,
    handleDeleteComment,
    handleReplyToComment,
    handleCancelReply,
    handleSubmitComment,
    handleConfirmDelete,
    handleCloseDeleteModal,
  } = useComments(postId);

  // Render comment item
  const renderCommentItem = React.useCallback(
    ({ item }: { item: any }) => (
      <CommentItem
        comment={item}
        onDeletePress={handleDeleteComment}
        onReplyPress={handleReplyToComment}
      />
    ),
    [handleDeleteComment, handleReplyToComment]
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
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    commentsContainer: {
      flex: 1,
      paddingHorizontal: scale(8),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: verticalScale(40),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: verticalScale(40),
    },
    emptyText: {
      fontSize: moderateScale(16),
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    listContent: {
      paddingVertical: verticalScale(8),
    },  
  });

  // Sheets and Modals
  const Reactions = (() => {
    const reactionsProps = renderReactionsModal();
    return reactionsProps ? (
      <ReactionsModal
        visible={reactionsProps.visible}
        postId={reactionsProps.postId}
        onClose={reactionsProps.onClose}
      />
    ) : null;
  })();

  const Actions = (() => {
    const actionProps = renderActionSheet();
    return actionProps ? (
    <ActionSheet ref={actionProps.ref} options={actionProps.options} />
    ) : null;
  })();

  const Collections = (() => {
    const collectionsProps = renderCollectionsModal();
    return (
    <CollectionsModal
      ref={collectionsProps.ref}
      onCollectionSelect={collectionsProps.onCollectionSelect}
    />
    );
  })();

  // Show loading if either post or comments are loading initially
  if (loading || (isLoadingComments && !post)) {
    return <ScreenLoading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScreenHeader
        title={t("screenTitles.post")}
        rightComponent={post && !post.postAuthor.isAdmin ? "ellipsis" : null}
        onRightPress={post && !post.postAuthor.isAdmin ? () => handlePostOptionsPress(post) : undefined}
      />
      <KeyboardHandler enabled={true} style={styles.content}>
        <ScrollView contentContainerStyle={styles.listContent}>
          {/* Post Card */}
          {post && (
            <View>
            <PostCard
              post={post}
              onReaction={handleReaction}
              onComment={() => {}} 
              onImagePress={handleImagePress}
              onReadMore={() => {}} 
              onReactionsPress={handleReactionsPress}
              onUserPress={handleUserPress}
              onOptionsPress={undefined}
              showFullText={true}
            />
            {/* Separator */}
          <Separator />
          </View>
          )}
          {/* Comments List */}
          <View style={styles.commentsContainer}>
            {isLoadingComments ? renderLoader() : 
              <FlashList
                data={comments}
                keyExtractor={(item) => item.commentId}
                renderItem={renderCommentItem}
                onEndReached={handleLoadMoreComments}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
              />
            }
          </View>
        </ScrollView>
        {/* Comment Input at Bottom */}
        <CommentInput
          onSubmitComment={handleSubmitComment}
          replyToComment={replyToComment}
          onCancelReply={handleCancelReply}
        />
      </KeyboardHandler>

      {/* Sheets and Modals */}
      {Reactions}
      {Actions}
      {Collections}
      <ImageViewer {...renderImageViewer()} />
      <ConfirmationModal {...renderDeleteConfirmationModal()} />
      <ConfirmationModal {...renderRemoveConfirmationModal()} />

      {/* Comment Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        icon="trash-outline"
        description={t("confirmation.deleteComment.description")}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </SafeAreaView>
  );
}
