import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { r2 } from "./storage";
import { Id } from "./_generated/dataModel";


// Report a user
export const reportUser = mutation({
  args: {
    reportedUserId: v.id("users"),
    reportType: v.union(
      v.literal("harassment"),
      v.literal("hate_speech"),
      v.literal("inappropriate_content"),
      v.literal("spam"),
      v.literal("other")
    ),
    reportReason: v.string(),
    attachment: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const reporterId = await getAuthUserId(ctx);
    if (!reporterId) {
      throw new Error("Not authenticated");
    }

    // Validate that user is not reporting themselves
    if (reporterId === args.reportedUserId) {
      throw new Error("You cannot report yourself");
    }

    // Validate that the reported user exists
    const reportedUser = await ctx.db.get(args.reportedUserId);
    if (!reportedUser) {
      throw new Error("Reported user not found");
    }

    // Check if user has already reported this user
    const existingReport = await ctx.db
      .query("reportedUsers")
      .withIndex("by_reportedUser_reporter", (q) =>
        q.eq("reportedUserId", args.reportedUserId).eq("reporterId", reporterId)
      )
      .first();

    if (existingReport) {
      throw new Error("You have already reported this user");
    }

    // Validate report reason length
    if (args.reportReason.trim().length < 10) {
      throw new Error("Report reason must be at least 10 characters long");
    }

    if (args.reportReason.trim().length > 500) {
      throw new Error("Report reason must be less than 500 characters");
    }

    // Create the report
    const reportId = await ctx.db.insert("reportedUsers", {
      reportedUserId: args.reportedUserId,
      reporterId,
      reportType: args.reportType,
      reportReason: args.reportReason.trim(),
      attachment: args.attachment,
    });

    return reportId;
  },
});

// Report a post
export const reportPost = mutation({
  args: {
    postId: v.id("posts"),
    reportType: v.union(
      v.literal("harassment"),
      v.literal("hate_speech"),
      v.literal("inappropriate_content"),
      v.literal("spam"),
      v.literal("other")
    ),
    reportReason: v.string(),
    attachment: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const reporterId = await getAuthUserId(ctx);
    if (!reporterId) {
      throw new Error("Not authenticated");
    }

    // Validate that the post exists and get the post owner
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Validate that user is not reporting their own post
    if (reporterId === post.userId) {
      throw new Error("You cannot report your own post");
    }

    // Check if user has already reported this post
    const existingReport = await ctx.db
      .query("reportedPosts")
      .withIndex("by_post_reporter", (q) =>
        q.eq("postId", args.postId).eq("reporterId", reporterId)
      )
      .first();

    if (existingReport) {
      throw new Error("You have already reported this post");
    }

    // Validate report reason length
    if (args.reportReason.trim().length < 10) {
      throw new Error("Report reason must be at least 10 characters long");
    }

    if (args.reportReason.trim().length > 500) {
      throw new Error("Report reason must be less than 500 characters");
    }

    // Create the report
    const reportId = await ctx.db.insert("reportedPosts", {
      postId: args.postId,
      reportedUserId: post.userId,
      reporterId,
      reportType: args.reportType,
      reportReason: args.reportReason.trim(),
      attachment: args.attachment,
    });

    return reportId;
  },
});

// Helper function to check if user is admin
const checkAdminAccess = async (ctx: any) => {
  const currentUserId = await getAuthUserId(ctx);
  if (!currentUserId) {
    throw new Error("Not authenticated");
  }

  const currentUser = await ctx.db.get(currentUserId);
  if (!currentUser?.isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  return currentUserId;
};

// Query to get user reports with detailed information (for admin purposes)
export const getUserReportsWithDetails = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const limit = args.limit || 50;

    const userReports = await ctx.db
      .query("reportedUsers")
      .order("desc")
      .take(limit);

    // Enrich reports with user details
    const enrichedReports = await Promise.all(
      userReports.map(async (report) => {
        // Get reported user data
        const reportedUser = await ctx.db.get(report.reportedUserId);

        // Get reporter data
        const reporterUser = await ctx.db.get(report.reporterId);

        // Get attachment URL
        const attachmentUrl = await ctx.storage.getUrl(report.attachment);

        // Get reported user profile picture URL
        const reportedUserProfilePictureUrl = reportedUser?.profilePicture
          ? await r2.getUrl(reportedUser.profilePicture)
          : null;

        return {
          ...report,
          reportId: report._id,
          createdAt: report._creationTime,
          reportedUser: {
            name: reportedUser?.name || "Unknown User",
            userName: reportedUser?.userName || "unknown",
            profilePicture: reportedUserProfilePictureUrl,
          },
          reporter: {
            name: reporterUser?.name || "Unknown User",
            userName: reporterUser?.userName || "unknown",
          },
          attachmentUrl,
        };
      })
    );

    return enrichedReports;
  },
});

// Query to get post reports with detailed information (for admin purposes)
export const getPostReportsWithDetails = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const limit = args.limit || 50;

    const postReports = await ctx.db
      .query("reportedPosts")
      .order("desc")
      .take(limit);

    // Enrich reports with post and user details
    const enrichedReports = await Promise.all(
      postReports.map(async (report) => {
        // Get post details
        const post = await ctx.db.get(report.postId);

        // Get post owner's user data
        const postOwnerUser = post?.userId
          ? await ctx.db.get(post.userId)
          : null;

        // Get reporter's user data
        const reporterUser = report.reporterId
          ? await ctx.db.get(report.reporterId)
          : null;

        // Get attachment URL
        const attachmentUrl = await ctx.storage.getUrl(report.attachment);



        // Get post image URLs if they exist
        const postImageUrls =
          post?.images && post.images.length > 0
            ? await Promise.all(
                post.images.map((imageKey) => r2.getUrl(imageKey))
              )
            : [];

        return {
          ...report,
          reportId: report._id,
          createdAt: report._creationTime,
          post: {
            content: post?.content || "Post not found",
            imageUrls: postImageUrls,
          },
          postOwner: {
            name: postOwnerUser?.name || "Unknown User",
            userName: postOwnerUser?.userName || "unknown",
            profilePicture: postOwnerUser?.profilePicture
              ? await ctx.storage.getUrl(postOwnerUser.profilePicture)
              : null,
          },
          reporter: {
            name: reporterUser?.name || "Unknown User",
            userName: reporterUser?.userName || "unknown",
          },
          attachmentUrl,
        };
      })
    );

    return enrichedReports;
  },
});

// Resolve user report (remove the report)
export const resolveUserReport = mutation({
  args: {
    reportId: v.id("reportedUsers"),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // Delete the report (resolve by removing)
    await ctx.db.delete(args.reportId);

    return { success: true };
  },
});

// Delete user and resolve report
export const deleteUserAndResolveReport = mutation({
  args: {
    reportId: v.id("reportedUsers"),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    // Get the report
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    const userId = report.reportedUserId;

    // Get user profile to delete (if exists)
    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!userProfile) throw new Error("Profile not found");

    console.log(`Starting complete user deletion for userId: ${userId}`);

    // 1. Delete all posts created by the user and their associated data
    const userPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const post of userPosts) {
      // Delete all comments on this post (by any user)
      const postComments = await ctx.db
        .query("comments")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .collect();

      for (const comment of postComments) {
        await ctx.db.delete(comment._id);
      }

      // Delete all reactions on this post (by any user)
      const postReactions = await ctx.db
        .query("reactions")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .collect();

      for (const reaction of postReactions) {
        await ctx.db.delete(reaction._id);
      }

      // Update counters (since we're deleting the post anyway, no need to update counters)

      // Delete post images if they exist
      if (post.images && post.images.length > 0) {
        // Delete post images from R2
        for (const imageKey of post.images) {
          await r2.deleteObject(ctx, imageKey);
        }
      }

      // Delete the post itself
      await ctx.db.delete(post._id);
    }

    // 2. Delete all comments made by the user on other users' posts
    const userComments = await ctx.db
      .query("comments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Group comments by post to batch update counters
    const commentsByPost = new Map<string, number>();
    for (const comment of userComments) {
      await ctx.db.delete(comment._id);
      const postId = comment.postId;
      commentsByPost.set(postId, (commentsByPost.get(postId) || 0) + 1);
    }

    // Update comment counters for affected posts
    for (const [postId, count] of commentsByPost) {
      const post = await ctx.db.get(postId as Id<"posts">);
      if (post) {
        await ctx.db.patch(postId as Id<"posts">, {
          commentsCount: Math.max(0, post.commentsCount - count),
        });
      }
    }

    // 3. Delete all reactions made by the user on other users' posts
    const userLikes = await ctx.db
      .query("reactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Group reactions by post to batch update counters
    const likesByPost = new Map<string, number>();
    for (const like of userLikes) {
      await ctx.db.delete(like._id);
      const postId = like.postId;
      likesByPost.set(postId, (likesByPost.get(postId) || 0) + 1);
    }

    // Update reaction counters for affected posts
    for (const [postId, count] of likesByPost) {
      const post = await ctx.db.get(postId as Id<"posts">);
      if (post) {
        await ctx.db.patch(postId as Id<"posts">, {
          reactionsCount: Math.max(0, post.reactionsCount - count),
        });
      }
    }

    // 4. Delete all collections owned by the user
    const userCollections = await ctx.db
      .query("collections")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const collection of userCollections) {
      // Remove collection reference from all posts in this collection
      const postsInCollection = await ctx.db
        .query("posts")
        .withIndex("by_collectionId", (q) =>
          q.eq("collectionId", collection._id)
        )
        .collect();

      for (const post of postsInCollection) {
        await ctx.db.patch(post._id, {
          collectionId: undefined,
        });
      }

      // Delete the collection itself
      await ctx.db.delete(collection._id);
    }

    // 5. Delete all friend requests involving the user
    const sentFriendRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .collect();

    for (const request of sentFriendRequests) {
      await ctx.db.delete(request._id);
    }

    const receivedFriendRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .collect();

    for (const request of receivedFriendRequests) {
      await ctx.db.delete(request._id);
    }

    // 6. Delete all friendships involving the user
    const friendships1 = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const friendship of friendships1) {
      await ctx.db.delete(friendship._id);
    }

    const friendships2 = await ctx.db
      .query("friendships")
      .withIndex("by_friend", (q) => q.eq("friendId", userId))
      .collect();

    for (const friendship of friendships2) {
      await ctx.db.delete(friendship._id);
    }

    // 7. Delete all blocked user records involving the user
    const blockedByUser = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker", (q) => q.eq("blockerUserId", userId))
      .collect();

    for (const blocked of blockedByUser) {
      await ctx.db.delete(blocked._id);
    }

    const blockedUser = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocked", (q) => q.eq("blockedUserId", userId))
      .collect();

    for (const blocked of blockedUser) {
      await ctx.db.delete(blocked._id);
    }

    // 9. Delete all notifications involving the user
    const userNotificationsAsRecipient = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .collect();

    for (const notification of userNotificationsAsRecipient) {
      await ctx.db.delete(notification._id);
    }

    // Note: We're not deleting notifications where the user is the sender
    // as this might remove important notifications from other users' inboxes

    // 10. Delete all reports made by the user or about the user
    const reportsMadeByUser = await ctx.db
      .query("reportedUsers")
      .withIndex("by_reporter", (q) => q.eq("reporterId", userId))
      .collect();

    for (const report of reportsMadeByUser) {
      // Delete report attachment
      if (report.attachment) {
        await ctx.storage.delete(report.attachment);
      }
      await ctx.db.delete(report._id);
    }

    const reportsAboutUser = await ctx.db
      .query("reportedUsers")
      .withIndex("by_reportedUser", (q) => q.eq("reportedUserId", userId))
      .collect();

    for (const report of reportsAboutUser) {
      // Delete report attachment
      if (report.attachment) {
        await ctx.storage.delete(report.attachment);
      }
      await ctx.db.delete(report._id);
    }

    const postReportsMadeByUser = await ctx.db
      .query("reportedPosts")
      .withIndex("by_reporter", (q) => q.eq("reporterId", userId))
      .collect();

    for (const report of postReportsMadeByUser) {
      // Delete report attachment
      if (report.attachment) {
        await ctx.storage.delete(report.attachment);
      }
      await ctx.db.delete(report._id);
    }

    const postReportsAboutUser = await ctx.db
      .query("reportedPosts")
      .withIndex("by_reportedUser", (q) => q.eq("reportedUserId", userId))
      .collect();

    for (const report of postReportsAboutUser) {
      // Delete report attachment
      if (report.attachment) {
        await ctx.storage.delete(report.attachment);
      }
      await ctx.db.delete(report._id);
    }

    // 11. Delete the user's profile picture and profile
    const user = await ctx.db.get(userId);
    if (user?.profilePicture) {
      // Delete profile picture from R2
      await r2.deleteObject(ctx, user.profilePicture);
    }

    // Delete profile from profiles table
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.delete(profile._id);
    }

    console.log(`Completed application data cleanup for userId: ${userId}`);

    // 12. Delete from auth tables (in correct order to avoid foreign key issues)
    console.log(`Starting auth data cleanup for userId: ${userId}`);

    // First, get all accounts for this user
    const userAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();

    // Delete all verification codes for the user's accounts
    for (const account of userAccounts) {
      const verificationCodes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .collect();

      for (const code of verificationCodes) {
        await ctx.db.delete(code._id);
      }
    }

    // Get all sessions for this user
    const userSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // Delete all refresh tokens for the user's sessions
    for (const session of userSessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();

      for (const token of refreshTokens) {
        await ctx.db.delete(token._id);
      }
    }

    // Delete all sessions for the user
    for (const session of userSessions) {
      await ctx.db.delete(session._id);
    }

    // Delete all accounts for the user
    for (const account of userAccounts) {
      await ctx.db.delete(account._id);
    }

    // Delete any auth verifiers associated with the user's sessions
    for (const session of userSessions) {
      const verifiers = await ctx.db
        .query("authVerifiers")
        .filter((q) => q.eq(q.field("sessionId"), session._id))
        .collect();

      for (const verifier of verifiers) {
        await ctx.db.delete(verifier._id);
      }
    }

    // Delete any rate limit records (these are typically by identifier like email)
    // We'll skip this as it's complex to determine which rate limits belong to this user
    // and they will naturally expire anyway

    // Finally, delete the user record itself
    await ctx.db.delete(userId);

    console.log(`Completed complete user deletion for userId: ${userId}`);

    // Delete the report
    await ctx.db.delete(args.reportId);

    return { success: true };
  },
});

// Resolve post report (remove the report)
export const resolvePostReport = mutation({
  args: {
    reportId: v.id("reportedPosts"),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // Delete the report (resolve by removing)
    await ctx.db.delete(args.reportId);

    return { success: true };
  },
});

// Delete post and resolve report
export const deletePostAndResolveReport = mutation({
  args: {
    reportId: v.id("reportedPosts"),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // Get the post
    const post = await ctx.db.get(report.postId);
    if (post) {
      // Delete post images from storage if they exist
      if (post.images && post.images.length > 0) {
        for (const imageKey of post.images) {
          await r2.deleteObject(ctx, imageKey);
        }
      }

      // Delete all comments on this post
      const postComments = await ctx.db
        .query("comments")
        .withIndex("by_postId", (q) => q.eq("postId", report.postId))
        .collect();

      for (const comment of postComments) {
        await ctx.db.delete(comment._id);
      }

      // Delete all reactions on this post
      const postReactions = await ctx.db
        .query("reactions")
        .withIndex("by_postId", (q) => q.eq("postId", report.postId))
        .collect();

      for (const reaction of postReactions) {
        await ctx.db.delete(reaction._id);
      }

      // Delete the post itself
      await ctx.db.delete(post._id);
    }

    // Delete the report
    await ctx.db.delete(args.reportId);

    return { success: true };
  },
});
