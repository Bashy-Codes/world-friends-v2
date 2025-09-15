import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { R2, type R2Callbacks } from "@convex-dev/r2";
import { DataModel } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateConvexUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

const r2 = new R2(components.r2);

const callbacks: R2Callbacks = internal.storage;

export const {
  syncMetadata,
  getMetadata,
  listMetadata,
  deleteObject,
  onSyncMetadata,
} = r2.clientApi<DataModel>({
  checkUpload: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },

  checkReadKey: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },

  checkReadBucket: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },

  checkDelete: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },

  onUpload: async (_ctx, bucket, key) => {
    console.log(`File uploaded: ${key} to bucket: ${bucket}`);
  },

  onDelete: async (_ctx, bucket, key) => {
    console.log(`File deleted: ${key} from bucket: ${bucket}`);
  },

  onSyncMetadata: async (ctx, args) => {
    console.log("onSyncMetadata", args);
    const metadata = await r2.getMetadata(ctx, args.key);
    console.log("metadata", metadata);
  },

  callbacks,
});

// Generate upload URL for user profile photos
export const generateProfileUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Generate user-based key: profile-photos/{userId}-{timestamp}
    const timestamp = Date.now();
    const customKey = `profile-photos/${userId}-${timestamp}`;
    return await r2.generateUploadUrl(customKey);
  },
});

// Generate upload URL for post images
export const generatePostUploadUrl = mutation({
  args: {
    postId: v.id("posts"),
    imageIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify the post exists and belongs to the user
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.userId !== userId) {
      throw new Error("You can only upload images to your own posts");
    }

    // Generate content-based key: post-images/postId/{indexNumber}
    const customKey = `post-images/${args.postId}/${args.imageIndex}`;
    return await r2.generateUploadUrl(customKey);
  },
});

export { r2 };
