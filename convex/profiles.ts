import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

import { r2 } from "./storage";
import { Id } from "./_generated/dataModel";

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

function getAgeGroup(birthDate: string): "13-17" | "18-100" {
  const age = calculateAge(birthDate);
  return age < 18 ? "13-17" : "18-100";
}

/**
 * Update user supporter status
 * This should be called when a user makes a purchase through RevenueCat
 */
export const updateSupporterStatus = mutation({
  args: {
    isSupporter: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Update the user's supporter status
    await ctx.db.patch(userId, {
      isSupporter: args.isSupporter,
    });

    return { success: true };
  },
});


export const getCurrentUserId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId;
  },
});

export const getCurrentProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const [user, profile, userInfo] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("userInformation")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    if (!user || !profile || !userInfo) return null;

    const profilePictureUrl = await r2.getUrl(user.profilePicture);

    return {
      ...user,
      ...profile,
      profilePictureUrl,
      age: calculateAge(user.birthDate),
      ageGroup: getAgeGroup(user.birthDate),
      genderPreference: userInfo.genderPreference,
    };
  },
});

export const checkUsernameAvailability = query({
  args: { userName: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userName", (q) => q.eq("userName", args.userName))
      .unique();
    return !existing;
  },
});

export const createProfile = mutation({
  args: {
    name: v.string(),
    userName: v.string(),
    profilePicture: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    birthDate: v.string(),
    country: v.string(),
    spokenLanguages: v.array(v.string()),
    learningLanguages: v.array(v.string()),
    aboutMe: v.string(),
    hobbies: v.array(v.string()),
    genderPreference: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existingProfile) throw new Error("Profile already exists");

    const age = calculateAge(args.birthDate);
    if (age < 13) throw new Error("Must be at least 13 years old");

    const ageGroup = getAgeGroup(args.birthDate);

    // Update user record
    await ctx.db.patch(userId, {
      name: args.name,
      userName: args.userName,
      profilePicture: args.profilePicture,
      gender: args.gender,
      birthDate: args.birthDate,
      country: args.country,
      isAdmin: false,
      isSupporter: false,
    });

    // Create profile record
    const profileId = await ctx.db.insert("profiles", {
      userId,
      spokenLanguages: args.spokenLanguages,
      learningLanguages: args.learningLanguages,
      aboutMe: args.aboutMe,
      hobbies: args.hobbies,
    });

    // Create userInformation record for discovery
    await ctx.db.insert("userInformation", {
      userId,
      genderPreference: args.genderPreference,
      ageGroup,
      lastActive: Date.now(),
    });

    // Create default "My Drawings" collection for the new user
    await ctx.db.insert("collections", {
      userId,
      title: "My Drawings",
      postsCount: 0,
    });

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    country: v.string(),
    spokenLanguages: v.array(v.string()),
    learningLanguages: v.array(v.string()),
    aboutMe: v.string(),
    hobbies: v.array(v.string()),
    genderPreference: v.boolean(),
    profilePicture: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const [user, profile, userInfo] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("userInformation")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    if (!user || !profile || !userInfo) return null;

    // Handle profile picture change
    if (user.profilePicture !== args.profilePicture) {
      // Delete old profile picture from R2
      if (user.profilePicture) {
        await r2.deleteObject(ctx, user.profilePicture);
      }
    }

    const ageGroup = getAgeGroup(user.birthDate);

    // Update user record
    await ctx.db.patch(userId, {
      name: args.name,
      country: args.country,
      profilePicture: args.profilePicture,
    });

    // Update profile record
    await ctx.db.patch(profile._id, {
      spokenLanguages: args.spokenLanguages,
      learningLanguages: args.learningLanguages,
      aboutMe: args.aboutMe,
      hobbies: args.hobbies,
    });

    // Update userInformation record
    await ctx.db.patch(userInfo._id, {
      genderPreference: args.genderPreference,
      ageGroup,
      lastActive: Date.now(),
    });

    return profile._id;
  },
});

export const updateLastActive = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userInfo = await ctx.db
      .query("userInformation")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!userInfo) return;

    await ctx.db.patch(userInfo._id, {
      lastActive: Date.now(),
    });
  },
});


export const deleteProfile = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const [user, profile, userInfo] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("userInformation")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    if (!user || !profile || !userInfo) throw new Error("Profile not found");

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

    // 11. Delete user data from all tables
    if (user.profilePicture) {
      // Delete profile picture from R2
      await r2.deleteObject(ctx, user.profilePicture);
    }

    // Delete from profiles table
    await ctx.db.delete(profile._id);

    // Delete from userInformation table
    await ctx.db.delete(userInfo._id);

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
    return { success: true };
  },
});
