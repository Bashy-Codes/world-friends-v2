import { Id } from "@/convex/_generated/dataModel";

/**
 * Conversation-related TypeScript interfaces and types
 */

export interface ConversationData {
  conversationGroupId: string;
  createdAt: number;
  lastMessageId?: Id<"messages">;
  lastMessageTime: number;
  hasUnreadMessages: boolean;
  otherUser: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isAdmin?: boolean;
    isSupporter?: boolean;
  };
  lastMessage?: MessageData;
}

export interface MessageData {
  messageId: Id<"messages">;
  createdAt: number;
  conversationGroupId: string;
  senderId: Id<"users">;
  content?: string;
  type: "text" | "image";
  imageId?: Id<"_storage">;
  replyParentId?: Id<"messages">;
  replyParent?: {
    messageId: Id<"messages">;
    content?: string;
    type: "text" | "image";
    sender: {
      userId: Id<"users">;
      name: string;
      profilePicture: string | null;
    };
  };
  sender: {
    userId: Id<"users">;
    name: string;
    profilePicture: string | null;
  };
  isOwner: boolean;
  imageUrl?: string;
}

// Props for ConversationItem component
export interface ConversationItemProps {
  conversation: ConversationData;
  onPress: (conversationGroupId: string) => void;
}

export interface ConversationInfo {
  otherUser: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isAdmin?: boolean;
    isSupporter?: boolean;
  };
}
