import React, { useCallback } from "react";
import { StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { verticalScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { useConversation } from "@/hooks/conversations/useConversation";
import { useMessages } from "@/hooks/conversations/useMessages";
import { MessageData } from "@/types/conversations";

// components
import { KeyboardHandler } from "@/components/common/KeyboardHandler";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { EmptyState } from "@/components/EmptyState";
import { ConversationHeader } from "@/components/conversations/ConversationHeader";
import { MessageBubble } from "@/components/conversations/MessageBubble";
import { MessageInput } from "@/components/conversations/MessageInput";
import { ActionModal } from "@/components/conversations/ActionModal";
import { ScreenLoading } from "@/components/ScreenLoading";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();

  // Validate conversationGroupId
  if (!id) {
    return <EmptyState style={{ flex: 1 }} />;
  }
  const conversationGroupId = id as string;

  const { messages, isLoading, loadOlderMessages, hasOlderMessages } = useMessages(conversationGroupId);

  const {
    conversationInfo,
    selectedMessage,
    replyingTo,
    isLoadingConversation,
    isSending,
    error,
    actionModalVisible,
    deleteMessageModalVisible,
    flatListRef,
    handleBackPress,
    handleMessageLongPress,
    handleReply,
    handleDeleteMessage,
    handleSendMessage,
    handleSendImage,
    setActionModalVisible,
    setDeleteMessageModalVisible,
    confirmDeleteMessage,
    cancelReply,
  } = useConversation(conversationGroupId);

  // Handle load more messages
  const handleLoadMore = useCallback(() => {
    if (hasOlderMessages && !isLoading) {
      console.log("Loading Older Messages...");
      loadOlderMessages();
    }
  }, [hasOlderMessages, isLoading, loadOlderMessages]);

  // Render message item
  const renderMessage = useCallback(
    ({ item }: { item: MessageData }) => (
      <MessageBubble message={item} onLongPress={handleMessageLongPress} />
    ),
    [handleMessageLongPress]
  );

  // Optimize getItemLayout for predictable message heights
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80, 
      offset: 80 * index,
      index,
    }),
    []
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    messagesContent: {
      paddingVertical: verticalScale(16),
    },
  });

  // Show loading state when either conversation info or initial messages are loading
  if (isLoadingConversation || (isLoading && messages.length === 0)) {
    return <ScreenLoading />;
  }

  if (error || !conversationInfo) {
    return <EmptyState style={{ flex: 1 }} />;
  }

  return (
    <KeyboardHandler enabled={true} style={styles.container}>
      {/* Header */}
      <ConversationHeader
        otherUser={conversationInfo.otherUser}
        onBackPress={handleBackPress}
        onOptionsPress={() => {}}
      />

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        contentContainerStyle={styles.messagesContent}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        inverted={true}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
        isSending={isSending}
        messagePlaceholder={t("common.typeMessage")}
      />

      {/* Action Modal for message actions */}
      <ActionModal
        visible={actionModalVisible}
        message={selectedMessage}
        onReply={handleReply}
        onDelete={handleDeleteMessage}
        onClose={() => setActionModalVisible(false)}
      />

      {/* Delete Message Confirmation Modal */}
      <ConfirmationModal
        visible={deleteMessageModalVisible}
        icon="trash-outline"
        iconColor={theme.colors.error}
        description={t("confirmation.deleteMessage.description")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteMessageModalVisible(false)}
      />
    </KeyboardHandler>
  );
}