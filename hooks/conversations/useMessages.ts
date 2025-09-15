import { useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageData } from "@/types/conversations";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Custom hook for managing conversation messages with pagination
 *
 * This hook provides:
 * - Paginated message loading (10 messages per load)
 * - FlashList v1 compatible data ordering with inverted list
 * - Convex returns newest first (desc), perfect for inverted FlashList v1
 * - Load older messages when scrolling down with onEndReached
 * - Loading states
 * - Error handling
 * - Other user info for header
 */
export const useMessages = (conversationGroupId: string) => {
  const {
    results,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.communications.conversations.getConversationMessages,
    { conversationGroupId },
    { initialNumItems: 10 }
  );

  // Extract messages from results
  const messages = results || [];

  // Transform the data to match our MessageData interface
  const transformedMessages: MessageData[] = messages.map((msg: any) => ({
    messageId: msg.messageId,
    createdAt: msg.createdAt,
    conversationGroupId: msg.conversationGroupId,
    senderId: msg.senderId,
    content: msg.content,
    type: msg.type,
    imageId: msg.imageId,
    replyParentId: msg.replyParentId,
    replyParent: msg.replyParent
      ? {
        messageId: msg.replyParent.messageId,
        content: msg.replyParent.content,
        type: msg.replyParent.type,
        sender: {
          userId: msg.sender.userId,
          name: msg.replyParent.sender.name,
          profilePicture: msg.sender.profilePicture,
        },
      }
      : undefined,
    sender: msg.sender,
    isOwner: msg.isOwner,
    imageUrl: msg.imageUrl || undefined,
  }));

  // Load older messages (when pulling down from top)
  const loadOlderMessages = useCallback(() => {
    if (status === "CanLoadMore" && !isLoading) {
      loadMore(10);
    }
  }, [status, isLoading, loadMore]);

  return {
    messages: transformedMessages,
    isLoading,
    status,
    loadOlderMessages,
    hasOlderMessages: status === "CanLoadMore",
  };
};
