import { query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { r2 } from "./storage";
import { calculateAge } from "./helpers";

async function isUserExcluded(
  ctx: QueryCtx,
  currentUserId: Id<"users">,
  targetUserId: Id<"users">
): Promise<boolean> {
  if (currentUserId === targetUserId) return true;

  const [blocked1, blocked2, friendship] =
    await Promise.all([
      ctx.db
        .query("blockedUsers")
        .withIndex("by_both", (q) =>
          q.eq("blockerUserId", currentUserId).eq("blockedUserId", targetUserId)
        )
        .first(),
      ctx.db
        .query("blockedUsers")
        .withIndex("by_both", (q) =>
          q.eq("blockerUserId", targetUserId).eq("blockedUserId", currentUserId)
        )
        .first(),
      ctx.db
        .query("friendships")
        .withIndex("by_both", (q) =>
          q.eq("userId", currentUserId).eq("friendId", targetUserId)
        )
        .first(),
    ]);

  const isBlocked = blocked1 || blocked2;
  const isFriend = friendship;

  return !!(isBlocked || isFriend);
}

async function transformUserToUserCard(
  ctx: QueryCtx,
  user: Doc<"users">,
  profile: Doc<"profiles">
) {
  const profilePictureUrl = await r2.getUrl(user.profilePicture);

  return {
    userId: user._id,
    profilePicture: profilePictureUrl,
    name: user.name,
    gender: user.gender,
    age: calculateAge(user.birthDate),
    country: user.country,
    spokenLanguages: profile.spokenLanguages,
    learningLanguages: profile.learningLanguages,
    isAdmin: user.isAdmin,
    isSupporter: user.isSupporter,
  };
}

export const getUsersForDiscovery = query({
  args: {
    paginationOpts: paginationOptsValidator,
    // Filter functionality - at least one must be provided if filtering
    country: v.optional(v.string()),
    spokenLanguage: v.optional(v.string()),
    learningLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const [currentUser, currentUserInfo] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("userInformation")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    if (!currentUser || !currentUserInfo) throw new Error("User not found");

    // Determine if we're in filter mode
    const isFilterMode = !!(args.country || args.spokenLanguage || args.learningLanguage);

    // Validate filter mode - at least one filter must be provided
    if (isFilterMode && !args.country && !args.spokenLanguage && !args.learningLanguage) {
      throw new Error("At least one filter must be provided when filtering");
    }

    // Use userInformation table for server-side filtering
    let results;
    if (currentUserInfo.genderPreference) {
      results = await ctx.db
        .query("userInformation")
        .withIndex("by_ageGroup_genderPreference_lastActive", (q) =>
          q
            .eq("ageGroup", currentUserInfo.ageGroup)
            .eq("genderPreference", currentUserInfo.genderPreference)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      results = await ctx.db
        .query("userInformation")
        .withIndex("by_ageGroup_lastActive", (q) =>
          q.eq("ageGroup", currentUserInfo.ageGroup)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const validUsers = [];

    for (const userInfo of results.page) {
      // Skip self
      if (userInfo.userId === userId) continue;

      // Get user and profile data
      const [user, profile] = await Promise.all([
        ctx.db.get(userInfo.userId),
        ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", userInfo.userId))
          .unique(),
      ]);

      if (!user || !profile) continue;

      // Exclude admins from discovery
      if (user.isAdmin) continue;

      // Apply current user's gender preference filter
      if (currentUserInfo.genderPreference && user.gender !== currentUser.gender) {
        continue;
      }

      // Apply other user's gender preference filter (mutual compatibility)
      if (userInfo.genderPreference && currentUser.gender !== user.gender) {
        continue;
      }

      // Apply filters if in filter mode
      if (isFilterMode) {
        // Apply country filter if specified
        if (args.country && user.country !== args.country) {
          continue;
        }

        // Apply language filters if specified
        if (args.spokenLanguage && !profile.spokenLanguages.includes(args.spokenLanguage)) {
          continue;
        }

        if (args.learningLanguage && !profile.learningLanguages.includes(args.learningLanguage)) {
          continue;
        }
      }

      const excluded = await isUserExcluded(ctx, userId, userInfo.userId);
      if (!excluded) {
        validUsers.push({ user, profile });
      }
    }

    const userCards = await Promise.all(
      validUsers.map(({ user, profile }) => transformUserToUserCard(ctx, user, profile))
    );

    return {
      ...results,
      page: userCards,
    };
  },
});
