import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { createNotification } from "../notifications";
import { areFriends, calculateAge, calculateDaysUntilDelivery } from "../helpers";
import { r2 } from "../storage";


/**
 * Schedule a new letter
 */
export const scheduleLetter = mutation({
  args: {
    recipientId: v.id("users"),
    title: v.string(),
    content: v.string(),
    daysUntilDelivery: v.number(), // Number of days from now
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Validation
    if (args.title.trim().length === 0) {
      throw new Error("Title is required");
    }
    if (args.title.trim().length > 100) {
      throw new Error("Title must be 100 characters or less");
    }
    if (args.content.trim().length < 100) {
      throw new Error("Content must be at least 100 characters");
    }
    if (args.content.trim().length > 2000) {
      throw new Error("Content must be 2000 characters or less");
    }
    if (args.daysUntilDelivery < 1 || args.daysUntilDelivery > 30) {
      throw new Error("Delivery must be between 1 and 30 days from now");
    }

    // Check if recipient exists
    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) throw new Error("Recipient not found");

    // Check if users are friends
    const friendship = await areFriends(ctx, currentUserId, args.recipientId);
    if (!friendship) {
      throw new Error("You can only send letters to friends");
    }

    // Calculate delivery timestamp
    const deliverAt = Date.now() + (args.daysUntilDelivery * 24 * 60 * 60 * 1000);

    // Create the letter
    const letterId = await ctx.db.insert("letters", {
      senderId: currentUserId,
      recipientId: args.recipientId,
      title: args.title.trim(),
      content: args.content.trim(),
      deliverAt,
    });

    // Get sender data for notification
    const sender = await ctx.db.get(currentUserId);
    if (sender) {
      // Send notification to recipient
      await createNotification(
        ctx,
        args.recipientId,
        currentUserId,
        "letter_scheduled",
        {letterDeliveryDays: args.daysUntilDelivery}
      );
    }

    return { success: true, letterId };
  },
});


/**
 * Get received letters for the current user (only delivered letters)
 */
export const getUserReceivedLetters = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const now = Date.now();

    // Get letters where deliverAt <= now (delivered letters only)
    const result = await ctx.db
      .query("letters")
      .withIndex("by_recipient_deliverAt", (q) =>
        q.eq("recipientId", currentUserId).lte("deliverAt", now)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Transform letters with sender information
    const enrichedLetters = await Promise.all(
      result.page.map(async (letter) => {
        // Get sender user data
        const sender = await ctx.db.get(letter.senderId);
        if (!sender) throw new Error("Sender not found");

        // Get sender profile picture URL
        const senderProfilePictureUrl = await r2.getUrl(sender.profilePicture);

        return {
          letterId: letter._id,
          senderId: letter.senderId,
          recipientId: letter.recipientId,
          title: letter.title,
          content: letter.content,
          deliverAt: letter.deliverAt,
          createdAt: letter._creationTime,
          sender: {
            userId: sender._id,
            name: sender.name,
            profilePicture: senderProfilePictureUrl,
            gender: sender.gender,
            age: calculateAge(sender.birthDate),
            country: sender.country,
          },
          isDelivered: true,
        };
      })
    );

    return {
      ...result,
      page: enrichedLetters,
    };
  },
});

/**
 * Get sent letters for the current user (all letters)
 */
export const getUserSentLetters = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const now = Date.now();

    // Get all sent letters
    const result = await ctx.db
      .query("letters")
      .withIndex("by_sender", (q) => q.eq("senderId", currentUserId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Transform letters with recipient information
    const enrichedLetters = await Promise.all(
      result.page.map(async (letter) => {
        // Get recipient user data
        const recipient = await ctx.db.get(letter.recipientId);
        if (!recipient) throw new Error("Recipient not found");

        // Get recipient profile picture URL
        const recipientProfilePictureUrl = await r2.getUrl(recipient.profilePicture);

        const isDelivered = letter.deliverAt <= now;
        const daysUntilDelivery = isDelivered ? 0 : calculateDaysUntilDelivery(letter.deliverAt);

        return {
          letterId: letter._id,
          senderId: letter.senderId,
          recipientId: letter.recipientId,
          title: letter.title,
          content: letter.content,
          deliverAt: letter.deliverAt,
          createdAt: letter._creationTime,
          recipient: {
            userId: recipient._id,
            name: recipient.name,
            profilePicture: recipientProfilePictureUrl,
            gender: recipient.gender,
            age: calculateAge(recipient.birthDate),
            country: recipient.country,
          },
          isDelivered,
          daysUntilDelivery,
        };
      })
    );

    return {
      ...result,
      page: enrichedLetters,
    };
  },
});

/**
 * Get a specific letter by ID
 */
export const getLetter = query({
  args: { letterId: v.id("letters") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const letter = await ctx.db.get(args.letterId);
    if (!letter) throw new Error("Letter not found");

    // Check if user is sender or recipient
    if (letter.senderId !== currentUserId && letter.recipientId !== currentUserId) {
      throw new Error("Not authorized to view this letter");
    }

    // If user is recipient, check if letter is delivered
    if (letter.recipientId === currentUserId && letter.deliverAt > Date.now()) {
      throw new Error("Letter not yet delivered");
    }

    const isSender = letter.senderId === currentUserId;
    const now = Date.now();
    const isDelivered = letter.deliverAt <= now;
    const daysUntilDelivery = isDelivered ? 0 : calculateDaysUntilDelivery(letter.deliverAt);

    // Only get the relevant user data (sender for received letters, recipient for sent letters)
    const relevantUserId = isSender ? letter.recipientId : letter.senderId;
    const relevantUser = await ctx.db.get(relevantUserId);

    if (!relevantUser) throw new Error("User data not found");

    return {
      letterId: letter._id,
      title: letter.title,
      content: letter.content,
      deliverAt: letter.deliverAt,
      createdAt: letter._creationTime,
      isSender,
      isDelivered,
      daysUntilDelivery,
      otherUser: {
        name: relevantUser.name,
        country: relevantUser.country,
      },
    };
  },
});


/**
 * Delete a letter (sender can delete anytime, recipient can delete delivered letters)
 */
export const deleteLetter = mutation({
  args: { letterId: v.id("letters") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const letter = await ctx.db.get(args.letterId);
    if (!letter) throw new Error("Letter not found");

    // Check permissions
    const isSender = letter.senderId === currentUserId;
    const isRecipient = letter.recipientId === currentUserId;
    const isDelivered = letter.deliverAt <= Date.now();

    if (!isSender && !isRecipient) {
      throw new Error("Not authorized to delete this letter");
    }

    // Recipients can only delete delivered letters
    if (isRecipient && !isDelivered) {
      throw new Error("Cannot delete undelivered letters");
    }

    // Delete the letter
    await ctx.db.delete(args.letterId);

    return { success: true };
  },
});
