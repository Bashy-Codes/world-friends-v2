import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { createNotification } from "./userManagement";
import { areFriends } from "./helpers";
import { r2 } from "./storage";

async function hasPendingRequest(
  ctx: QueryCtx | MutationCtx,
  senderId: Id<"users">,
  receiverId: Id<"users">
): Promise<boolean> {
  const [request, reverseRequest] = await Promise.all([
    ctx.db
      .query("friendRequests")
      .withIndex("by_both", (q) =>
        q.eq("senderId", senderId).eq("receiverId", receiverId)
      )
      .first(),
    ctx.db
      .query("friendRequests")
      .withIndex("by_both", (q) =>
        q.eq("senderId", receiverId).eq("receiverId", senderId)
      )
      .first(),
  ]);

  return !!(request || reverseRequest);
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

async function batchEnrichProfiles(
  ctx: QueryCtx,
  userIds: Id<"users">[]
): Promise<
  Array<{
    userId: Id<"users">;
    profileId: Id<"profiles">;
    profilePicture: string;
    name: string;
    gender: "male" | "female" | "other";
    age: number;
    country: string;
    isAdmin?: boolean;
    isSupporter?: boolean;
  } | null>
> {
  if (userIds.length === 0) return [];

  const users = await Promise.all(
    userIds.map((userId) => ctx.db.get(userId))
  );

  const profiles = await Promise.all(
    userIds.map((userId) =>
      ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first()
    )
  );

  const enrichedProfiles = await Promise.all(
    users.map(async (user, index) => {
      if (!user) return null;
      const profile = profiles[index];
      if (!profile) return null;

      const profilePictureUrl = await r2.getUrl(user.profilePicture);

      return {
        userId: user._id,
        profileId: profile._id,
        profilePicture: profilePictureUrl,
        name: user.name,
        gender: user.gender,
        age: calculateAge(user.birthDate),
        country: user.country,
        isAdmin: user.isAdmin,
        isSupporter: user.isSupporter,
      };
    })
  );

  return enrichedProfiles;
}

export const sendFriendRequest = mutation({
  args: {
    receiverId: v.id("users"),
    requestMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    if (!args.requestMessage.trim()) {
      throw new Error("Request message cannot be empty");
    }

    if (args.requestMessage.length > 300) {
      throw new Error("Request message is too long");
    }

    if (currentUserId === args.receiverId) {
      throw new Error("Cannot send friend request to yourself");
    }

    const alreadyFriends = await areFriends(
      ctx,
      currentUserId,
      args.receiverId
    );
    if (alreadyFriends) {
      throw new Error("You are already friends with this user");
    }

    const pendingRequest = await hasPendingRequest(
      ctx,
      currentUserId,
      args.receiverId
    );
    if (pendingRequest) {
      throw new Error("A friend request already exists");
    }

    const receiver = await ctx.db.get(args.receiverId);
    if (!receiver) {
      throw new Error("User not found");
    }

    await ctx.db.insert("friendRequests", {
      senderId: currentUserId,
      receiverId: args.receiverId,
      requestMessage: args.requestMessage.trim(),
    });

    // Get sender's user data for notification
    const senderUser = await ctx.db.get(currentUserId);

    if (senderUser) {
      // Send notification to receiver
      await createNotification(
        ctx,
        args.receiverId,
        currentUserId,
        "friend_request_sent",
        `${senderUser.name} sent you a friend request`
      );
    }

    return { success: true };
  },
});

export const getFriendRequests = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId)
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUserId))
      .order("desc")
      .paginate(args.paginationOpts);

    const senderIds = requests.page.map((request) => request.senderId);
    const enrichedProfiles = await batchEnrichProfiles(ctx, senderIds);

    const enrichedPage = requests.page
      .map((request, index) => {
        const profile = enrichedProfiles[index];
        if (!profile) return null;

        return {
          requestId: request._id,
          profilePicture: profile.profilePicture,
          name: profile.name,
          gender: profile.gender,
          age: profile.age,
          country: profile.country,
          requestMessage: request.requestMessage,
          senderId: request.senderId,
        };
      })
      .filter((request) => request !== null);

    return {
      ...requests,
      page: enrichedPage,
    };
  },
});

export const getUserFriends = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId)
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .order("desc")
      .paginate(args.paginationOpts);

    const friendUserIds = friendships.page.map(
      (friendship) => friendship.friendId
    );
    const enrichedProfiles = await batchEnrichProfiles(ctx, friendUserIds);
    const validFriends = enrichedProfiles.filter(
      (profile) => profile !== null
    );

    return {
      ...friendships,
      page: validFriends,
    };
  },
});

export const acceptFriendRequest = mutation({
  args: {
    requestId: v.id("friendRequests"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Friend request not found");
    }

    if (request.receiverId !== currentUserId) {
      throw new Error("You can only accept requests sent to you");
    }

    const alreadyFriends = await areFriends(
      ctx,
      request.senderId,
      request.receiverId
    );
    if (alreadyFriends) {
      await ctx.db.delete(args.requestId);
      return { success: true };
    }

    // Create dual friendship records for efficient one-direction queries
    await ctx.db.insert("friendships", {
      userId: request.senderId,
      friendId: request.receiverId,
    });

    await ctx.db.insert("friendships", {
      userId: request.receiverId,
      friendId: request.senderId,
    });

    await ctx.db.delete(args.requestId);

    // Get accepter's user data for notification
    const accepterUser = await ctx.db.get(currentUserId);

    if (accepterUser) {
      // Send notification to original sender
      await createNotification(
        ctx,
        request.senderId,
        currentUserId,
        "friend_request_accepted",
        `${accepterUser.name} accepted your friend request`
      );
    }

    return { success: true };
  },
});

export const rejectFriendRequest = mutation({
  args: {
    requestId: v.id("friendRequests"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Friend request not found");
    }

    if (request.receiverId !== currentUserId) {
      throw new Error("You can only reject requests sent to you");
    }

    await ctx.db.delete(args.requestId);

    // Get rejecter's user data for notification
    const rejecterUser = await ctx.db.get(currentUserId);

    if (rejecterUser) {
      // Send notification to original sender
      await createNotification(
        ctx,
        request.senderId,
        currentUserId,
        "friend_request_rejected",
        `${rejecterUser.name} declined your friend request`
      );
    }

    return { success: true };
  },
});

export const removeFriend = mutation({
  args: {
    friendUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    if (currentUserId === args.friendUserId) {
      throw new Error("Cannot remove yourself as friend");
    }

    // Find and delete both friendship records
    const friendship1 = await ctx.db
      .query("friendships")
      .withIndex("by_both", (q) =>
        q.eq("userId", currentUserId).eq("friendId", args.friendUserId)
      )
      .first();

    const friendship2 = await ctx.db
      .query("friendships")
      .withIndex("by_both", (q) =>
        q.eq("userId", args.friendUserId).eq("friendId", currentUserId)
      )
      .first();

    if (!friendship1 || !friendship2) {
      throw new Error("You are not friends with this user");
    }

    // Delete both friendship records
    await ctx.db.delete(friendship1._id);
    await ctx.db.delete(friendship2._id);

    // Get current user's data for notification
    const currentUser = await ctx.db.get(currentUserId);

    if (currentUser) {
      // Send notification to the removed friend
      await createNotification(
        ctx,
        args.friendUserId,
        currentUserId,
        "friend_removed",
        `${currentUser.name} removed you from friends`
      );
    }

    return { success: true };
  },
});
