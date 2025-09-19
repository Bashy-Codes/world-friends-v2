import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { verticalScale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { type PostTypes } from "@/types/feed";
import { useFeed } from "@/hooks/feed/useFeed";
import { useTheme } from "@/lib/Theme";


// UI components
import { ReactionsModal } from "@/components/feed/ReactionsModal";
import { ActionSheet } from "@/components/common/ActionSheet";
import { CollectionsModal } from "@/components/feed/CollectionsModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ImageViewer } from "@/components/common/ImageViewer";
import { TabHeader } from "@/components/TabHeader";
import { Greetings } from "@/components/feed/Greetings";
import { PostCard } from "@/components/feed/PostCard";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { EmptyState } from "@/components/EmptyState";

export default function HomeTab() {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    // State
    posts,
    loading,
    loadingMore,

    // Post interaction handlers
    handleReaction,
    handleComment,
    handleReactionsPress,
    handleImagePress,
    handleReadMore,
    handleCreatePost,

    // Load more
    handleLoadMore,

    // Navigation handlers
    handleUserPress,
    handlePostOptionsPress,

    // Component renderers

    renderReactionsModal,
    renderImageViewer,
    renderActionSheet,
    renderCollectionsModal,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  } = useFeed();

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

  const renderSkeleton = useCallback(() => <PostCardSkeleton />, []);

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
  })()
  const Actions = (() => {
    const actionProps = renderActionSheet();
    return actionProps ? (
      <ActionSheet ref={actionProps.ref} options={actionProps.options} />
    ) : null;
  })()
  const Collections = (() => {
    const collectionsProps = renderCollectionsModal();
    return (
      <CollectionsModal
        ref={collectionsProps.ref}
        onCollectionSelect={collectionsProps.onCollectionSelect}
      />
    );
  })()

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loadingMore, theme.colors.primary]);

  const renderEmptyState = useCallback(
    () => <EmptyState style={{ flex: 1, minHeight: verticalScale(400) }} />,
    []
  );

  // List renderers and props
  const skeletonData = useMemo(() => Array(10).fill(null), []);

  const renderItem = loading ? renderSkeleton : renderPost
  
  const keyExtractor = useCallback(
    (item: any, index: number) => (loading ? `skeleton-${index}` : item.postId),
    [loading]
  );

  const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        listContainer: {
          flex: 1,
        },
        contentContainer: {
          paddingTop: verticalScale(100),
          paddingBottom: verticalScale(100),
        },
        footerLoader: {
          paddingVertical: verticalScale(20),
          alignItems: "center",
        },
      });

      
  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <TabHeader title={t("screenTitles.home")} />
      <View style={styles.listContainer}>
        <FlashList
          data={loading ? skeletonData : posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Greetings onCreatePost={handleCreatePost} actionText={t("actions.writeSomething")}/>
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          contentContainerStyle={styles.contentContainer}
        />
      </View>

      {/* Sheets and Modals */}
      {Reactions}
      {Actions}
      {Collections}
      <ImageViewer {...renderImageViewer()} />
      <ConfirmationModal {...renderDeleteConfirmationModal()} />
      <ConfirmationModal {...renderRemoveConfirmationModal()} />
    </SafeAreaView>
  );
}
