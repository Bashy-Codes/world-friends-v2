import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createNotification } from "../notifications";
import { areFriends } from "../helpers";
import { r2 } from "../storage";

// Helper function to generate conversation group ID
function generateConversationGroupId(
  userId1: Id<"users">,
  userId2: Id<"users">
): string {
  return [userId1, userId2].sort().join("-");
}

export const createConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, { otherUserId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    if (currentUserId === otherUserId) {
      throw new Error("Cannot create conversation with yourself");
    }

    // Check if conversation already exists
    const conversationGroupId = generateConversationGroupId(currentUserId, otherUserId);
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_both", (q) =>
        q.eq("userId", currentUserId).eq("otherUserId", otherUserId)
      )
      .first();

    if (existingConversation) {
      return existingConversation.conversationGroupId;
    }

    const areUserFriends = await areFriends(ctx, currentUserId, otherUserId);

    if (!areUserFriends) {
      throw new Error("You can only create conversations with friends");
    }

    // Create dual conversation records
    await ctx.db.insert("conversations", {
      userId: currentUserId,
      otherUserId: otherUserId,
      conversationGroupId,
      lastMessageTime: Date.now(),
      hasUnreadMessages: false,
    });

    await ctx.db.insert("conversations", {
      userId: otherUserId,
      otherUserId: currentUserId,
      conversationGroupId,
      lastMessageTime: Date.now(),
      hasUnreadMessages: false,
    });

    return conversationGroupId;
  },
});

export const sendMessage = mutation({
  args: {
    conversationGroupId: v.string(),
    content: v.optional(v.string()),
    type: v.union(v.literal("text"), v.literal("image")),
    imageId: v.optional(v.id("_storage")),
    replyParentId: v.optional(v.id("messages")),
  },
  handler: async (ctx, { conversationGroupId, content, type, imageId, replyParentId }) => {
    const senderId = await getAuthUserId(ctx);
    if (!senderId) {
      throw new Error("Not authenticated");
    }

    // Verify user is participant in conversation
    const senderConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .filter((q) => q.eq(q.field("userId"), senderId))
      .first();

    if (!senderConversation) {
      throw new Error("Not authorized to send messages in this conversation");
    }

    // Validate message content based on type
    if (type === "text" && !content?.trim()) {
      throw new Error("Text messages must have content");
    }
    if (type === "image" && !imageId) {
      throw new Error("Image messages must have an imageId");
    }

    // If replying, verify the parent message exists and belongs to this conversation
    if (replyParentId) {
      const parentMessage = await ctx.db.get(replyParentId);
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }
      if (parentMessage.conversationGroupId !== conversationGroupId) {
        throw new Error("Parent message does not belong to this conversation");
      }
    }

    // Create message
    const messageData: any = {
      conversationGroupId,
      senderId,
      type,
    };

    if (content?.trim()) {
      messageData.content = content.trim();
    }
    if (imageId) {
      messageData.imageId = imageId;
    }
    if (replyParentId) {
      messageData.replyParentId = replyParentId;
    }

    const messageId = await ctx.db.insert("messages", messageData);

    // Update both conversation records
    const otherUserId = senderConversation.otherUserId;
    const currentTime = Date.now();

    // Update sender's conversation record (mark as read for sender)
    await ctx.db.patch(senderConversation._id, {
      lastMessageId: messageId,
      lastMessageTime: currentTime,
      hasUnreadMessages: false,
    });

    // Update receiver's conversation record (mark as unread for receiver)
    const receiverConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .filter((q) => q.eq(q.field("userId"), otherUserId))
      .first();

    if (receiverConversation) {
      await ctx.db.patch(receiverConversation._id, {
        lastMessageId: messageId,
        lastMessageTime: currentTime,
        hasUnreadMessages: true,
      });
    }

    return messageId;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, { messageId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Get message
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender can delete their own messages
    if (message.senderId !== currentUserId) {
      throw new Error("Not authorized to delete this message");
    }

    // If message has an image, delete the storage file first
    if (message.type === "image" && message.imageId) {
      await ctx.storage.delete(message.imageId);
    }

    // Hard delete the message
    await ctx.db.delete(messageId);

    // If this was the last message, we need to update both conversation records
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", message.conversationGroupId)
      )
      .collect();

    for (const conversation of conversations) {
      if (conversation.lastMessageId === messageId) {
        // Find the new last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversationGroup", (q) =>
            q.eq("conversationGroupId", message.conversationGroupId)
          )
          .order("desc")
          .first();

        await ctx.db.patch(conversation._id, {
          lastMessageId: lastMessage?._id,
          lastMessageTime:
            lastMessage?._creationTime || conversation.lastMessageTime,
        });
      }
    }
  },
});



export const deleteConversation = mutation({
  args: {
    conversationGroupId: v.string(),
  },
  handler: async (ctx, { conversationGroupId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Get user's conversation record
    const userConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .first();

    if (!userConversation) {
      throw new Error("Not authorized to delete this conversation");
    }

    // Get all conversation records for this group
    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .collect();

    // Delete all messages in the conversation (and their images)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationGroup", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .collect();

    for (const message of messages) {
      if (message.type === "image" && message.imageId) {
        await ctx.storage.delete(message.imageId);
      }
      await ctx.db.delete(message._id);
    }

    // Get current user for notification
    const currentUser = await ctx.db.get(currentUserId);

    // Send notification to other participant
    if (currentUser) {
      const otherParticipantId = userConversation.otherUserId;

      await createNotification(
        ctx,
        otherParticipantId,
        currentUserId,
        "conversation_deleted",
      );
    }

    // Delete all conversation records
    for (const conversation of allConversations) {
      await ctx.db.delete(conversation._id);
    }


  },
});

export const markAsRead = mutation({
  args: {
    conversationGroupId: v.string(),
  },
  handler: async (ctx, { conversationGroupId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Get user's conversation record
    const userConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .first();

    if (!userConversation) {
      throw new Error("Not authorized");
    }

    // Mark as read for current user
    await ctx.db.patch(userConversation._id, {
      hasUnreadMessages: false,
    });
  },
});

export const getUserConversations = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    // Use simplified query - get conversations where user is the owner
    const results = await ctx.db
      .query("conversations")
      .withIndex("by_user_lastMessageTime", (q) =>
        q.eq("userId", currentUserId)
      )
      .order("desc")
      .paginate(paginationOpts);

    const pageConversations = results.page;

    // Enrich conversations with user and last message data
    const enrichedConversations = await Promise.all(
      pageConversations.map(async (conversation) => {
        // Get the other user data
        const otherUserId = conversation.otherUserId;
        const otherUser = await ctx.db.get(otherUserId);
        if (!otherUser) {
          return null;
        }

        // Get profile picture URL
        const profilePictureUrl = await r2.getUrl(otherUser.profilePicture);

        // Get last message if exists
        let lastMessage = undefined;
        if (conversation.lastMessageId) {
          const message = await ctx.db.get(conversation.lastMessageId);
          if (message) {
            lastMessage = {
              messageId: message._id,
              content: message.content,
              type: message.type,
              senderId: message.senderId,
              createdAt: message._creationTime,
            };
          }
        }

        // Get unread status for current user (simplified)
        const hasUnreadMessages = conversation.hasUnreadMessages;

        return {
          conversationGroupId: conversation.conversationGroupId,
          createdAt: conversation._creationTime,
          lastMessageId: conversation.lastMessageId,
          lastMessageTime: conversation.lastMessageTime,
          hasUnreadMessages,
          otherUser: {
            userId: otherUser._id,
            name: otherUser.name,
            profilePicture: profilePictureUrl,
            isAdmin: otherUser.isAdmin,
            isSupporter: otherUser.isSupporter,
          },
          lastMessage,
        };
      })
    );

    // Filter out null results (where other user profile wasn't found)
    const validConversations = enrichedConversations.filter(
      (conv) => conv !== null
    );

    return {
      page: validConversations,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

export const getConversationMessages = query({
  args: {
    conversationGroupId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { conversationGroupId, paginationOpts }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Verify user is participant in conversation
    const userConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .first();

    if (!userConversation) {
      throw new Error("Not authorized to view this conversation");
    }

    // Get messages with pagination (desc order for most recent first)
    const results = await ctx.db
      .query("messages")
      .withIndex("by_conversationGroup", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .order("desc")
      .paginate(paginationOpts);

    // Enrich messages with sender data and image URLs
    const enrichedMessages = await Promise.all(
      results.page.map(async (message) => {
        // Get sender user data
        const senderUser = await ctx.db.get(message.senderId);
        if (!senderUser) {
          return null;
        }

        // Get sender profile picture URL
        const senderProfilePictureUrl = await r2.getUrl(senderUser.profilePicture);

        // Get image URL if message has image
        let imageUrl: string | null = null;
        if (message.type === "image" && message.imageId) {
          imageUrl = await ctx.storage.getUrl(message.imageId);
        }

        // Get reply parent data if this is a reply
        let replyParent = null;
        if (message.replyParentId) {
          const parentMessage = await ctx.db.get(message.replyParentId);
          if (parentMessage) {
            // Get parent message sender user data
            const parentSenderUser = await ctx.db.get(parentMessage.senderId);

            if (parentSenderUser) {
              replyParent = {
                messageId: parentMessage._id,
                content: parentMessage.content,
                type: parentMessage.type,
                sender: {
                  name: parentSenderUser.name,
                },
              };
            }
          }
        }

        return {
          messageId: message._id,
          createdAt: message._creationTime,
          conversationGroupId: message.conversationGroupId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          imageId: message.imageId,
          replyParentId: message.replyParentId,
          replyParent,
          isOwner: message.senderId === currentUserId,
          imageUrl,
          sender: {
            userId: senderUser._id,
            name: senderUser.name,
            profilePicture: senderProfilePictureUrl,
          },
        };
      })
    );

    // Filter out null results (where sender profile wasn't found)
    const validMessages = enrichedMessages.filter((msg) => msg !== null);

    return {
      ...results,
      page: validMessages,
    };
  },
});

export const getConversationInfo = query({
  args: {
    conversationGroupId: v.string(),
  },
  handler: async (ctx, { conversationGroupId }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Get user's conversation record
    const userConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversationGroupId", (q) =>
        q.eq("conversationGroupId", conversationGroupId)
      )
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .first();

    if (!userConversation) {
      throw new Error("Not authorized to view this conversation");
    }

    // Get the other user data
    const otherUserId = userConversation.otherUserId;
    const otherUser = await ctx.db.get(otherUserId);

    if (!otherUser) {
      throw new Error("Other user not found");
    }

    // Get profile picture URL
    const profilePictureUrl = await r2.getUrl(otherUser.profilePicture);

    return {
      otherUser: {
        userId: otherUser._id,
        name: otherUser.name,
        profilePicture: profilePictureUrl,
        isAdmin: otherUser.isAdmin,
        isSupporter: otherUser.isSupporter,
      },
    };
  },
});
