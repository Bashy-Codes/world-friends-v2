import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Helper function to check if two users are friends
 */
export async function areFriends(
  ctx: QueryCtx | MutationCtx,
  userId1: Id<"users">,
  userId2: Id<"users">
): Promise<boolean> {
  if (userId1 === userId2) return false;

  // Check if there's a friendship record where userId1 is the user and userId2 is the friend
  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_both", (q) =>
      q.eq("userId", userId1).eq("friendId", userId2)
    )
    .first();

  return !!friendship;
}

/**
 * Helper function to get user's friends list
 * Now simplified to use single direction lookup
 */
export async function getUserFriends(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<Id<"users">[]> {
  const friendships = await ctx.db
    .query("friendships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  return friendships.map((f) => f.friendId);
}
