import React, { useMemo, useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { useTheme } from "@/lib/Theme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConversations } from "@/hooks/conversations/useConversations";
import { ConversationData } from "@/types/conversations";

// components
import { TabHeader } from "@/components/TabHeader";
import { ConversationItem } from "@/components/conversations/ConversationItem";
import { ConversationItemSkeleton } from "@/components/conversations/ConversationItemSkeleton";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import {
  ActionSheet,
  ActionSheetOption,
  ActionSheetRef,
} from "@/components/common/ActionSheet";

import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";

export default function ConversationsTab() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conversations, isLoading, loading, loadMore, hasMore } =
    useConversations();

  // Refs
  const actionSheetRef = useRef<ActionSheetRef>(null);

  // State for delete functionality
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [deleteConversationModalVisible, setDeleteConversationModalVisible] = useState(false);

  // Mutation for deleting conversation
  const deleteConversationMutation = useMutation(api.communications.conversations.deleteConversation);

  // Navigation handler for conversation item press
  const handleConversationPress = useCallback(
    (conversationGroupId: string) => {
      router.push(`/screens/conversation/${conversationGroupId}` as any);
    },
    [router]
  );

  // Long press handler for conversation item
  const handleConversationLongPress = useCallback(
    (conversation: ConversationData) => {
      setSelectedConversation(conversation);
      actionSheetRef.current?.present();
    },
    []
  );

  // Handle delete conversation action
  const handleDeleteConversation = useCallback(() => {
    setDeleteConversationModalVisible(true);
  }, []);

  // Confirm delete conversation
  const confirmDeleteConversation = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      await deleteConversationMutation({
        conversationGroupId: selectedConversation.conversationGroupId
      });

      Toast.show({
        type: "success",
        text1: t("toasts.conversationDeleted.text1"),
        text2: t("toasts.conversationDeleted.text2"),
        position: "top",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2: t("errorToasts.genericError.text2"),
        position: "top",
      });
    } finally {
      setDeleteConversationModalVisible(false);
      setSelectedConversation(null);
    }
  }, [selectedConversation, deleteConversationMutation, t]);

  // Cancel delete conversation
  const cancelDeleteConversation = useCallback(() => {
    setDeleteConversationModalVisible(false);
    setSelectedConversation(null);
  }, []);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore(10);
    }
  }, [hasMore, isLoading, loadMore]);

  // Action sheet options
  const actionSheetOptions: ActionSheetOption[] = useMemo(
    () => [
      {
        id: "delete",
        title: t("actions.deleteConversation"),
        icon: "trash",
        color: theme.colors.error,
        onPress: handleDeleteConversation,
      },
    ],
    [theme.colors.error, handleDeleteConversation, t]
  );

  // Render conversation item
  const renderConversationItem = useCallback(
    ({ item }: { item: ConversationData }) => (
      <ConversationItem
        conversation={item}
        onPress={handleConversationPress}
        onLongPress={handleConversationLongPress}
      />
    ),
    [handleConversationPress, handleConversationLongPress]
  );

  const renderSkeleton = useCallback(() => <ConversationItemSkeleton />, []);

  const skeletonData = useMemo(() => Array(10).fill(null), []);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [hasMore, theme.colors.primary]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return <EmptyState style={{ flex: 1, minHeight: verticalScale(400) }} />;
  }, [loading]);

  const styles =
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      contentContainer: {
        flex: 1,
      },
      list: {
        flex: 1,
      },
      listContent: {
        paddingTop: verticalScale(8),
        paddingBottom: insets.bottom + verticalScale(20),
      },
      footerLoader: {
        paddingVertical: verticalScale(20),
        alignItems: "center",
      },
      emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: scale(32),
      },
      emptyTitle: {
        fontSize: moderateScale(20),
        fontWeight: "600",
        marginBottom: verticalScale(8),
        textAlign: "center",
      },
      emptyDescription: {
        fontSize: moderateScale(16),
        textAlign: "center",
        lineHeight: moderateScale(22),
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
    });

  return (
    <View style={styles.container}>
      <TabHeader title={t("screenTitles.conversations")} />
      <View style={styles.contentContainer}>
        <FlatList
          style={styles.list}
          contentContainerStyle={
            (styles.listContent,
            {
              paddingBottom: verticalScale(100),
              paddingTop: verticalScale(100),
            })
          }
          data={loading ? skeletonData : conversations}
          renderItem={loading ? renderSkeleton : renderConversationItem}
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.conversationGroupId
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      </View>

      {/* Action Sheet for conversation options */}
      <ActionSheet ref={actionSheetRef} options={actionSheetOptions} />

      {/* Delete Conversation Confirmation Modal */}
      <ConfirmationModal
        visible={deleteConversationModalVisible}
        icon="trash-outline"
        iconColor={theme.colors.error}
        description={t("confirmation.deleteConversation.description")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmDeleteConversation}
        onCancel={cancelDeleteConversation}
      />
    </View>
  );
}