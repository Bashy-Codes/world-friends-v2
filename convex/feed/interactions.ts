import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { areFriends } from "../helpers";
import { createNotification } from "../notifications";
import { r2 } from "../storage";

/**
 * Add or update a reaction on a post
 */
export const addPostReaction = mutation({
  args: {
    postId: v.id("posts"),
    emoji: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate emoji (basic validation)
    if (!args.emoji || args.emoji.length === 0) {
      throw new Error("Invalid emoji");
    }

    // Check if post exists
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Get post author's user data
    const postAuthor = await ctx.db.get(post.userId);

    // Check if users are friends, it's own post, or post author is admin
    const isFriend = await areFriends(ctx, userId, post.userId);
    const isPostByAdmin = postAuthor?.isAdmin || false;

    if (!isFriend && !isPostByAdmin && post.userId !== userId) {
      throw new Error("You can only react to posts from friends or admins");
    }

    // Check if user already reacted to this post
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_userId_postId", (q) =>
        q.eq("userId", userId).eq("postId", args.postId)
      )
      .first();

    if (existingReaction) {
      if (existingReaction.emoji === args.emoji) {
        // Same emoji - remove reaction
        await Promise.all([
          ctx.db.delete(existingReaction._id),
          ctx.db.patch(args.postId, {
            reactionsCount: Math.max(0, post.reactionsCount - 1),
          }),
        ]);
        return { success: true, hasReacted: false, userReaction: null };
      } else {
        // Different emoji - update reaction
        await ctx.db.patch(existingReaction._id, {
          emoji: args.emoji,
        });
        return { success: true, hasReacted: true, userReaction: args.emoji };
      }
    } else {
      // Add new reaction
      await Promise.all([
        ctx.db.insert("reactions", {
          userId,
          postId: args.postId,
          emoji: args.emoji,
        }),
        ctx.db.patch(args.postId, {
          reactionsCount: post.reactionsCount + 1,
        }),
      ]);

      // Send notification to post owner (if not reacting to own post)
      if (post.userId !== userId) {
        // Get reactor's user data for notification
        const reactorUser = await ctx.db.get(userId);

        if (reactorUser) {
          await createNotification(
            ctx,
            post.userId,
            userId,
            "post_reaction", 
          );
        }
      }

      return { success: true, hasReacted: true, userReaction: args.emoji };
    }
  },
});


/**
 * Get reactions for a post with pagination
 */
export const getPostReactions = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if post exists and user can access it
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Get post author's user data
    const postAuthor = await ctx.db.get(post.userId);

    // Check if users are friends, it's own post, or post author is admin
    const isFriend = await areFriends(ctx, userId, post.userId);
    const isPostByAdmin = postAuthor?.isAdmin || false;

    if (!isFriend && !isPostByAdmin && post.userId !== userId) {
      throw new Error(
        "You can only view reactions on posts from friends or admins"
      );
    }

    // Get reactions with pagination, ordered by creation time (newest first)
    const result = await ctx.db
      .query("reactions")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich reactions with user profile
    const enrichedReactions = await Promise.all(
      result.page.map(async (reaction) => {
        // Get user data
        const user = await ctx.db.get(reaction.userId);

        if (!user) {
          throw new Error("User not found for reaction author");
        }

        // Get profile picture URL
        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        return {
          reactionId: reaction._id,
          createdAt: reaction._creationTime,
          userId: reaction.userId,
          postId: reaction.postId,
          emoji: reaction.emoji,
          reactionAuthor: {
            userId: user._id,
            name: user.name,
            profilePicture: profilePictureUrl,
            isAdmin: user.isAdmin,
            isSupporter: user.isSupporter,
          },
        };
      })
    );

    return {
      ...result,
      page: enrichedReactions,
    };
  },
});

/**
 * Comment on a post or reply to a comment
 */
export const commentPost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    replyParentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    if (args.content.length > 1000) {
      throw new Error("Comment too long (max 1000 characters)");
    }

    // Check if post exists
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Get post author's user data
    const postAuthor = await ctx.db.get(post.userId);

    // Check if users are friends, it's own post, or post author is admin
    const isFriend = await areFriends(ctx, userId, post.userId);
    const isPostByAdmin = postAuthor?.isAdmin || false;

    if (!isFriend && !isPostByAdmin && post.userId !== userId) {
      throw new Error("You can only comment on posts from friends or admins");
    }

    // If this is a reply, validate the parent comment
    let parentComment = null;
    if (args.replyParentId) {
      parentComment = await ctx.db.get(args.replyParentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      if (parentComment.postId !== args.postId) {
        throw new Error("Parent comment does not belong to this post");
      }

      // Check if parent comment already has a reply (only one reply allowed)
      const existingReply = await ctx.db
        .query("comments")
        .withIndex("by_replyParent", (q) =>
          q.eq("replyParentId", args.replyParentId)
        )
        .first();

      if (existingReply) {
        throw new Error("This comment already has a reply");
      }

      // Don't allow replies to replies (only one level deep)
      if (parentComment.replyParentId) {
        throw new Error("Cannot reply to a reply");
      }
    }

    // Create the comment/reply and increment comments count
    const commentData: any = {
      userId,
      postId: args.postId,
      content: args.content.trim(),
    };

    if (args.replyParentId) {
      commentData.replyParentId = args.replyParentId;
    }

    const [commentId] = await Promise.all([
      ctx.db.insert("comments", commentData),
      ctx.db.patch(args.postId, {
        commentsCount: post.commentsCount + 1,
      }),
    ]);

    // Get commenter's user data for notifications
    const commenterUser = await ctx.db.get(userId);

    if (commenterUser) {
      if (args.replyParentId && parentComment) {
        // This is a reply - send notification to parent comment author (if not replying to own comment)
        if (parentComment.userId !== userId) {
          await createNotification(
            ctx,
            parentComment.userId,
            userId,
            "comment_replied",
          );
        }

        // Send notification to post owner (if not replying on own post and not already notified)
        if (post.userId !== userId && post.userId !== parentComment.userId) {
          await createNotification(
            ctx,
            post.userId,
            userId,
            "comment_replied",
          );
        }
      } else {
        // This is a regular comment - send notification to post owner (if not commenting on own post)
        if (post.userId !== userId) {
          await createNotification(
            ctx,
            post.userId,
            userId,
            "post_commented",
            `${commenterUser.name} commented on your post`,
          );
        }
      }
    }

    return { commentId, success: true };
  },
});

/**
 * Delete a comment or reply
 */
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the comment to verify ownership
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments");
    }

    // Get the post to update comment count
    const post = await ctx.db.get(comment.postId);
    if (!post) throw new Error("Post not found");

    let commentsToDelete = 1; // The comment itself

    // If this is a parent comment, delete replies first
    if (!comment.replyParentId) {
      // This is a parent comment - delete replies first
      const replies = await ctx.db
        .query("comments")
        .withIndex("by_replyParent", (q) => q.eq("replyParentId", args.commentId))
        .collect();

      for (const reply of replies) {
        await ctx.db.delete(reply._id);
        commentsToDelete++;
      }
    }

    // Delete the comment/reply and decrement comments count
    await Promise.all([
      ctx.db.delete(args.commentId),
      ctx.db.patch(comment.postId, {
        commentsCount: Math.max(0, post.commentsCount - commentsToDelete),
      }),
    ]);

    return { success: true };
  },
});



/**
 * Get comments for a post with pagination (parent comments with their replies nested)
 */
export const getComments = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if post exists and user can access it
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Get post author's user data
    const postAuthor = await ctx.db.get(post.userId);

    // Check if users are friends, it's own post, or post author is admin
    const isFriend = await areFriends(ctx, userId, post.userId);
    const isPostByAdmin = postAuthor?.isAdmin || false;

    if (!isFriend && !isPostByAdmin && post.userId !== userId) {
      throw new Error(
        "You can only view comments on posts from friends or admins"
      );
    }

    // Get only parent comments (not replies) with pagination, ordered by creation time (newest first)
    const result = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("replyParentId"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich comments with user profile and their replies
    const enrichedComments = await Promise.all(
      result.page.map(async (comment) => {
        // Get user data
        const user = await ctx.db.get(comment.userId);
        if (!user) {
          throw new Error("User not found for comment author");
        }

        // Get profile picture URL
        const profilePictureUrl = await r2.getUrl(user.profilePicture);

        // Check if this comment has a reply
        const reply = await ctx.db
          .query("comments")
          .withIndex("by_replyParent", (q) =>
            q.eq("replyParentId", comment._id)
          )
          .first();

        let replyData = null;
        if (reply) {
          // Get reply author user data
          const replyUser = await ctx.db.get(reply.userId);

          if (replyUser) {
            const replyProfilePictureUrl =
              await r2.getUrl(replyUser.profilePicture);

            replyData = {
              commentId: reply._id,
              createdAt: reply._creationTime,
              userId: reply.userId,
              postId: reply.postId,
              content: reply.content,
              replyParentId: reply.replyParentId,
              reply: null,
              hasReply: false,
              isOwner: reply.userId === userId,
              commentAuthor: {
                userId: replyUser._id,
                name: replyUser.name,
                profilePicture: replyProfilePictureUrl,
                isAdmin: replyUser.isAdmin,
                isSupporter: replyUser.isSupporter,
              },
            };
          }
        }

        return {
          commentId: comment._id,
          createdAt: comment._creationTime,
          userId: comment.userId,
          postId: comment.postId,
          content: comment.content,
          replyParentId: comment.replyParentId,
          reply: replyData,
          hasReply: !!reply,
          isOwner: comment.userId === userId,
          commentAuthor: {
            userId: user._id,
            name: user.name,
            profilePicture: profilePictureUrl,
            isAdmin: user.isAdmin,
            isSupporter: user.isSupporter,
          },
        };
      })
    );

    return {
      ...result,
      page: enrichedComments,
    };
  },
});
