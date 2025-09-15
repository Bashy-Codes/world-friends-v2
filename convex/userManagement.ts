/**
 * User Management System
 *
 * This module provides functions for managing user interactions:
 * 1. getUserProfile - Get detailed user profile with friendship status
 * 2. blockUser - Block a user and clean up relationships
 */

import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { r2 } from "./storage";

/**
 * Helper function to check if two users are friends
 */
async function checkFriendshipStatus(
  ctx: QueryCtx,
  currentUserId: Id<"users">,
  targetUserId: Id<"users">
): Promise<boolean> {
  // Check if friendship exists (only need to check one direction now)
  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_both", (q) =>
      q.eq("userId", currentUserId).eq("friendId", targetUserId)
    )
    .first();

  return !!friendship;
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get detailed user profile with friendship status
 * Returns all profile information needed for user profile screen
 */
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Get the target user data
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get the target user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) {
      throw new Error("User profile not found");
    }

    // Don't allow viewing own profile through this function
    if (currentUserId === args.userId) {
      throw new Error("Cannot view own profile through this function");
    }



    // Check if user is blocked (either direction)
    const isBlocked = await ctx.db
      .query("blockedUsers")
      .withIndex("by_both", (q) =>
        q.eq("blockerUserId", currentUserId).eq("blockedUserId", args.userId)
      )
      .first();

    const isBlockedBy = await ctx.db
      .query("blockedUsers")
      .withIndex("by_both", (q) =>
        q.eq("blockerUserId", args.userId).eq("blockedUserId", currentUserId)
      )
      .first();

    // If blocked in either direction, don't show profile
    if (isBlocked || isBlockedBy) {
      throw new Error("User profile not accessible");
    }

    // Check friendship status
    const isFriend = await checkFriendshipStatus(
      ctx,
      currentUserId,
      args.userId
    );

    // Check for pending friend requests
    const sentRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_both", (q) =>
        q.eq("senderId", currentUserId).eq("receiverId", args.userId)
      )
      .first();

    const receivedRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_both", (q) =>
        q.eq("senderId", args.userId).eq("receiverId", currentUserId)
      )
      .first();

    const hasPendingRequest = !!(sentRequest || receivedRequest);

    // Get profile picture URL
    const profilePictureUrl = await r2.getUrl(user.profilePicture);

    const userProfile = {
      userId: args.userId,
      profilePicture: profilePictureUrl,
      name: user.name,
      username: user.userName,
      gender: user.gender,
      age: calculateAge(user.birthDate),
      country: user.country,
      aboutMe: profile.aboutMe,
      spokenLanguages: profile.spokenLanguages,
      learningLanguages: profile.learningLanguages,
      hobbies: profile.hobbies,
      isAdmin: user.isAdmin,
      isSupporter: user.isSupporter,
      isFriend,
      hasPendingRequest,
    };

    return userProfile;
  },
});

/**
 * Block a user and clean up all relationships
 * This will:
 * 1. Add user to blocked list
 * 2. Remove friendship if exists
 * 3. Remove any pending friend requests (both directions)
 * 4. Delete any conversations between the users
 * 5. Delete all comments by blocked user on blocker's posts
 * 6. Delete all reactions by blocked user on blocker's posts
 * 7. Delete all comments by blocker on blocked user's posts
 * 8. Delete all reactions by blocker on blocked user's posts
 */
export const blockUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Get the target user
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Don't allow blocking yourself
    if (currentUserId === args.userId) {
      throw new Error("Cannot block yourself");
    }

    // Check if already blocked
    const existingBlock = await ctx.db
      .query("blockedUsers")
      .withIndex("by_both", (q) =>
        q.eq("blockerUserId", currentUserId).eq("blockedUserId", args.userId)
      )
      .first();

    if (existingBlock) {
      throw new Error("User is already blocked");
    }

    // 1. Add to blocked users
    await ctx.db.insert("blockedUsers", {
      blockerUserId: currentUserId,
      blockedUserId: args.userId,
    });

    // Get current user for notification
    const currentUser = await ctx.db.get(currentUserId);

    if (currentUser) {
      // Send notification to blocked user
      await createNotification(
        ctx,
        args.userId,
        currentUserId,
        "user_blocked",
        `${currentUser.name} has blocked you`
      );
    }

    // 2. Remove friendship if exists (both directions)
    const friendship1 = await ctx.db
      .query("friendships")
      .withIndex("by_both", (q) =>
        q.eq("userId", currentUserId).eq("friendId", args.userId)
      )
      .first();

    if (friendship1) {
      await ctx.db.delete(friendship1._id);
    }

    const friendship2 = await ctx.db
      .query("friendships")
      .withIndex("by_both", (q) =>
        q.eq("userId", args.userId).eq("friendId", currentUserId)
      )
      .first();

    if (friendship2) {
      await ctx.db.delete(friendship2._id);
    }

    // 3. Remove pending friend requests (both directions)
    const sentRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_both", (q) =>
        q.eq("senderId", currentUserId).eq("receiverId", args.userId)
      )
      .collect();

    for (const request of sentRequests) {
      await ctx.db.delete(request._id);
    }

    const receivedRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_both", (q) =>
        q.eq("senderId", args.userId).eq("receiverId", currentUserId)
      )
      .collect();

    for (const request of receivedRequests) {
      await ctx.db.delete(request._id);
    }

    // 5. Delete all comments by blocked user on blocker's posts
    const blockerPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .collect();

    for (const post of blockerPosts) {
      const blockedUserComments = await ctx.db
        .query("comments")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();

      for (const comment of blockedUserComments) {
        await ctx.db.delete(comment._id);
      }

      // Update comments count
      if (blockedUserComments.length > 0) {
        await ctx.db.patch(post._id, {
          commentsCount: Math.max(0, post.commentsCount - blockedUserComments.length),
        });
      }
    }

    // 6. Delete all reactions by blocked user on blocker's posts
    for (const post of blockerPosts) {
      const blockedUserReactions = await ctx.db
        .query("reactions")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();

      for (const reaction of blockedUserReactions) {
        await ctx.db.delete(reaction._id);
      }

      // Update reactions count
      if (blockedUserReactions.length > 0) {
        await ctx.db.patch(post._id, {
          reactionsCount: Math.max(0, post.reactionsCount - blockedUserReactions.length),
        });
      }
    }

    // 7. Delete all comments by blocker on blocked user's posts
    const blockedUserPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const post of blockedUserPosts) {
      const blockerComments = await ctx.db
        .query("comments")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .filter((q) => q.eq(q.field("userId"), currentUserId))
        .collect();

      for (const comment of blockerComments) {
        await ctx.db.delete(comment._id);
      }

      // Update comments count
      if (blockerComments.length > 0) {
        await ctx.db.patch(post._id, {
          commentsCount: Math.max(0, post.commentsCount - blockerComments.length),
        });
      }
    }

    // 8. Delete all reactions by blocker on blocked user's posts
    for (const post of blockedUserPosts) {
      const blockerReactions = await ctx.db
        .query("reactions")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .filter((q) => q.eq(q.field("userId"), currentUserId))
        .collect();

      for (const reaction of blockerReactions) {
        await ctx.db.delete(reaction._id);
      }

      // Update reactions count
      if (blockerReactions.length > 0) {
        await ctx.db.patch(post._id, {
          reactionsCount: Math.max(0, post.reactionsCount - blockerReactions.length),
        });
      }
    }

    return { success: true };
  },
});

/**
 * Helper function to create a notification
 */
export async function createNotification(
  ctx: any,
  recipientId: Id<"users">,
  senderId: Id<"users">,
  type:
    | "friend_request_sent"
    | "friend_request_accepted"
    | "friend_request_rejected"
    | "friend_removed"
    | "conversation_deleted"
    | "user_blocked"
    | "post_reaction"
    | "post_commented"
    | "comment_replied"
    | "letter_scheduled",
  content: string,
  // postId?: Id<"posts">,
  // commentId?: Id<"comments">
) {
  // Don't send notification to yourself
  if (recipientId === senderId) {
    return;
  }

  await ctx.db.insert("notifications", {
    recipientId,
    senderId,
    type,
    content,
    hasUnread: true,
    // postId,
    // commentId,
  });
}

/**
 * Get user notifications with pagination
 */
export const getUserNotifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId)
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", currentUserId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Get sender profiles for each notification
    const senderIds = notifications.page.map(
      (notification) => notification.senderId
    );
    const senderProfiles = await Promise.all(
      senderIds.map(async (senderId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", senderId))
          .unique();

        if (!profile) return null;

        // Get user data for the profile
        const user = await ctx.db.get(profile.userId);
        if (!user) return null;

        return {
          userId: profile.userId,
          name: user.name,
        };
      })
    );

    const enrichedPage = notifications.page
      .map((notification, index) => {
        const senderProfile = senderProfiles[index];
        if (!senderProfile) return null;

        return {
          notificationId: notification._id,
          type: notification.type,
          content: notification.content,
          hasUnread: notification.hasUnread,
          createdAt: notification._creationTime,
          sender: senderProfile,
        };
      })
      .filter((notification) => notification !== null);

    return {
      ...notifications,
      page: enrichedPage,
    };
  },
});

/**
 * Mark all notifications as read for the current user
 */
export const markNotificationsAsRead = mutation({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", currentUserId).eq("hasUnread", true)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        hasUnread: false,
      });
    }

    return { success: true };
  },
});

/**
 * Delete all notifications for the current user
 */
export const deleteAllNotifications = mutation({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", currentUserId))
      .collect();

    for (const notification of userNotifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true };
  },
});

/**
 * Check if user has unread notifications
 */
export const hasUnreadNotifications = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return false;

    const unreadNotification = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", currentUserId).eq("hasUnread", true)
      )
      .first();

    return !!unreadNotification;
  },
});
