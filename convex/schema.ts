import { defineSchema, defineTable } from "convex/server"
import { authTables } from "@convex-dev/auth/server"
import { v } from "convex/values"

const userManagementTables = {
  // Custom users table with Convex Auth fields + additional user data
  users: defineTable({
    // Required Convex Auth fields
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),

    // Additional user fields (moved from profiles) - required for our app
    userName: v.string(),
    name: v.string(),
    profilePicture: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    birthDate: v.string(),
    country: v.string(),
    isAdmin: v.boolean(),
    isSupporter: v.boolean(),
  })
    .index("email", ["email"])
    .index("by_userName", ["userName"])
    .index("by_country_gender", ["country", "gender"]),

  // Profile-specific data
  profiles: defineTable({
    userId: v.id("users"),
    aboutMe: v.string(),
    spokenLanguages: v.array(v.string()),
    learningLanguages: v.array(v.string()),
    hobbies: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  userInformation: defineTable({
    userId: v.id("users"),
    genderPreference: v.boolean(),
    ageGroup: v.union(v.literal("13-17"), v.literal("18-100")),
    lastActive: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_lastActive", ["lastActive"])
    .index("by_ageGroup_lastActive", ["ageGroup", "lastActive"])
    .index("by_ageGroup_genderPreference_lastActive", ["ageGroup", "genderPreference", "lastActive"]),

  blockedUsers: defineTable({
    blockerUserId: v.id("users"),
    blockedUserId: v.id("users"),
  })
    .index("by_blocker", ["blockerUserId"])
    .index("by_blocked", ["blockedUserId"])
    .index("by_both", ["blockerUserId", "blockedUserId"]),
}

const friendshipsTables = {
  friendRequests: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    requestMessage: v.string(),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_both", ["senderId", "receiverId"]),

  friendships: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_both", ["userId", "friendId"]),
}

const feedTables = {
  posts: defineTable({
    userId: v.id("users"),
    collectionId: v.optional(v.id("collections")),
    content: v.string(),
    images: v.optional(v.array(v.string())),
    tags: v.array(v.string()),
    commentsCount: v.number(),
    reactionsCount: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_collectionId", ["collectionId"]),

  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
    replyParentId: v.optional(v.id("comments")),
  })
    .index("by_userId", ["userId"])
    .index("by_postId", ["postId"])
    .index("by_replyParent", ["replyParentId"]),

  reactions: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    emoji: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_postId", ["postId"])
    .index("by_userId_postId", ["userId", "postId"]),

  collections: defineTable({
    userId: v.id("users"),
    title: v.string(),
    postsCount: v.number(),
  }).index("by_userId", ["userId"]),
}

const conversationsTables = {
  conversations: defineTable({
    userId: v.id("users"), // The user who "owns" this conversation record
    otherUserId: v.id("users"), // The other participant
    conversationGroupId: v.string(), // Shared identifier for both conversation records
    lastMessageId: v.optional(v.id("messages")),
    lastMessageTime: v.number(),
    hasUnreadMessages: v.boolean(), // Simplified - one boolean per user record
  })
    .index("by_user", ["userId"])
    .index("by_other_user", ["otherUserId"])
    .index("by_both", ["userId", "otherUserId"])
    .index("by_user_lastMessageTime", ["userId", "lastMessageTime"])
    .index("by_conversationGroupId", ["conversationGroupId"]),

  messages: defineTable({
    conversationGroupId: v.string(), // Reference the shared group instead of specific conversation
    senderId: v.id("users"),
    content: v.optional(v.string()),
    type: v.union(v.literal("text"), v.literal("image")),
    imageId: v.optional(v.id("_storage")),
    replyParentId: v.optional(v.id("messages")),
  })
    .index("by_conversationGroup", ["conversationGroupId"])
    .index("by_sender", ["senderId"])
    .index("by_replyParent", ["replyParentId"]),
}

const moderationTables = {
  reportedUsers: defineTable({
    reportedUserId: v.id("users"),
    reporterId: v.id("users"),
    reportType: v.union(
      v.literal("harassment"),
      v.literal("hate_speech"),
      v.literal("inappropriate_content"),
      v.literal("spam"),
      v.literal("other"),
    ),
    reportReason: v.string(),
    attachment: v.id("_storage"),
  })
    .index("by_reportedUser", ["reportedUserId"])
    .index("by_reporter", ["reporterId"])
    .index("by_reportedUser_reporter", ["reportedUserId", "reporterId"]),
  reportedPosts: defineTable({
    postId: v.id("posts"),
    reportedUserId: v.id("users"),
    reporterId: v.id("users"),
    reportType: v.union(
      v.literal("harassment"),
      v.literal("hate_speech"),
      v.literal("inappropriate_content"),
      v.literal("spam"),
      v.literal("other"),
    ),
    reportReason: v.string(),
    attachment: v.id("_storage"),
  })
    .index("by_post", ["postId"])
    .index("by_reportedUser", ["reportedUserId"])
    .index("by_reporter", ["reporterId"])
    .index("by_post_reporter", ["postId", "reporterId"]),
}

const lettersTables = {
  letters: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    title: v.string(),
    content: v.string(),
    deliverAt: v.number(), // Unix timestamp for when the letter should be delivered
  })
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_deliverAt", ["recipientId", "deliverAt"])
    .index("by_sender_deliverAt", ["senderId", "deliverAt"])
    .index("by_deliverAt", ["deliverAt"]), // For scheduled delivery processing
}

const notifications = {
  notifications: defineTable({
    recipientId: v.id("users"),
    senderId: v.id("users"), 
    type: v.union(
      v.literal("friend_request_sent"),
      v.literal("friend_request_accepted"),
      v.literal("friend_request_rejected"),
      v.literal("friend_removed"),
      v.literal("conversation_deleted"),
      v.literal("user_blocked"),
      v.literal("post_reaction"),
      v.literal("post_commented"),
      v.literal("comment_replied"),
      v.literal("letter_scheduled"), 
    ),
    content: v.string(),
    hasUnread: v.boolean(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_unread", ["recipientId", "hasUnread"]),
}

const schema = defineSchema({
  ...authTables,
  ...userManagementTables,
  ...friendshipsTables,
  ...feedTables,
  ...conversationsTables,
  ...moderationTables,
  ...lettersTables,
  ...notifications,
})

export default schema
