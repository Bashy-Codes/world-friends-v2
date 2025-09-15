import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationData } from "@/types/conversations";

/**
 * Custom hook for managing conversations with pagination
 *
 * This hook provides:
 * - Paginated conversation loading
 * - Loading states based on actual query status
 * - Error handling
 * - Load more functionality
 */
export const useConversations = () => {

  const {
    results: conversations,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.communications.conversations.getUserConversations,
    {},
    { initialNumItems: 10 }
  );

  // Transform the data to match our ConversationData interface
  const transformedConversations: ConversationData[] = conversations.map(
    (conv) => ({
      conversationGroupId: conv.conversationGroupId,
      createdAt: conv.createdAt,
      lastMessageId: conv.lastMessageId,
      lastMessageTime: conv.lastMessageTime,
      hasUnreadMessages: conv.hasUnreadMessages,
      otherUser: conv.otherUser,
      lastMessage: conv.lastMessage
        ? {
            messageId: conv.lastMessage.messageId,
            createdAt: conv.lastMessage.createdAt,
            conversationGroupId: conv.conversationGroupId,
            senderId: conv.lastMessage.senderId,
            content: conv.lastMessage.content,
            type: conv.lastMessage.type,
            imageId: undefined,
            replyParentId: undefined,
            sender: {
              userId: conv.otherUser.userId,
              name: conv.otherUser.name,
              profilePicture: conv.otherUser.profilePicture,
            },
            isOwner: false, // This will be determined by the component
          }
        : undefined,
    })
  );

  // Loading state based on actual Convex query status
  const loading = status === "LoadingFirstPage";

  return {
    conversations: transformedConversations,
    isLoading,
    loading,
    status,
    loadMore,
    hasMore: status === "CanLoadMore",
  };
};
