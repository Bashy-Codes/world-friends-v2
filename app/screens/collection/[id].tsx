import { useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { verticalScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { useCollection } from "@/hooks/feed/useCollection";
import { Id } from "@/convex/_generated/dataModel";
import type { CollectionPostTypes } from "@/types/feed";
import { useTranslation } from "react-i18next";

// UI components
import { ScreenHeader } from "@/components/ScreenHeader";
import { ScreenLoading } from "@/components/ScreenLoading";
import { PostCard } from "@/components/feed/PostCard";
import { CollectionHeader } from "@/components/feed/CollectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { ReactionsModal } from "@/components/feed/ReactionsModal";
import { ImageViewer } from "@/components/common/ImageViewer";
import { ActionSheet } from "@/components/common/ActionSheet";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Separator } from "@/components/common/Separator";

export default function CollectionScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Convert string ID to collection ID type
  const collectionId = id as Id<"collections">;

  const {
    // State
    areCollectionsLoading,
    isCollectionDetailsLoading,
    collectionPosts,
    collectionDetails,
    loadingMore,

    // Post interaction handlers
    handleReaction,
    handleComment,
    handleReactionsPress,
    handleImagePress,
    handleReadMore,
    handleUserPress,
    handleCollectionPostOptionsPress,

    // Pagination
    handleLoadMore,

    // Component renderers
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  } = useCollection(collectionId);

  const renderPost = useCallback(
    ({ item }: { item: CollectionPostTypes }) => (
      <PostCard
        post={item.post}
        onReaction={handleReaction}
        onComment={handleComment}
        onImagePress={handleImagePress}
        onReadMore={handleReadMore}
        onReactionsPress={handleReactionsPress}
        onUserPress={handleUserPress}
        onOptionsPress={() => handleCollectionPostOptionsPress(item)}
      />
    ),
    [
      handleReaction,
      handleComment,
      handleImagePress,
      handleReadMore,
      handleReactionsPress,
      handleUserPress,
      handleCollectionPostOptionsPress,
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

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loadingMore, theme.colors.primary]);

  const renderEmptyState = useCallback(() => {
    if (!areCollectionsLoading && collectionPosts.length > 0) return null;
    return <EmptyState style={{ flex: 1, minHeight: verticalScale(400) }} />;
  }, [areCollectionsLoading, collectionPosts]);

  // Show loading screen if still loading
  if (areCollectionsLoading || isCollectionDetailsLoading) {
    return <ScreenLoading />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    postsContainer: {
      flex: 1,
      paddingHorizontal: verticalScale(8),
    },
    footerLoader: {
      paddingVertical: verticalScale(20),
      alignItems: "center",
    },
    listContent: {
      paddingVertical: verticalScale(8),
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader
        title={collectionDetails?.title || t('screenTitle.collection')}
      />
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.listContent}>
          {/* Collection Header */}
          {collectionDetails && (
            <View>
              <CollectionHeader
                collectionDetails={{
                  collectionId: collectionDetails.collectionId,
                  title: collectionDetails.title,
                  postsCount: collectionDetails.postsCount,
                }}
              />
              {/* Separator */}
              <Separator />
            </View>
          )}

          {/* Posts List */}
          <View style={styles.postsContainer}>
            <FlashList
              data={collectionPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item.collectionPostId}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={renderFooter}
            />
          </View>
        </ScrollView>
      </View>

      {/* Sheets and Modals Components */}
      {ReactionsComponent}
      {ActionsComponent}
      <ImageViewer {...renderImageViewer()} />
      <ConfirmationModal {...renderDeleteConfirmationModal()} />
      <ConfirmationModal {...renderRemoveConfirmationModal()} />
    </SafeAreaView>
  );
}
