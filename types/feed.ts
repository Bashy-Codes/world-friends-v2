import { Id } from "@/convex/_generated/dataModel";

// Feed-related TypeScript types

export interface PostTypes {
  postId: Id<"posts">;
  userId: Id<"users">;
  content: string;
  postImages?: string[];
  tags: string[];
  reactionsCount: number;
  commentsCount: number;
  hasReacted: boolean;
  userReaction?: string; // The emoji the current user reacted with
  isOwner: boolean;
  createdAt: number;
  postAuthor: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isAdmin?: boolean;
    isSupporter?: boolean;
  };
}

export interface CommentTypes {
  commentId: Id<"comments">;
  createdAt: number;
  userId: Id<"users">;
  postId: Id<"posts">;
  content: string;
  replyParentId?: Id<"comments">;
  reply?: CommentTypes | null;
  hasReply: boolean;
  isOwner: boolean;
  commentAuthor: {
  userId: Id<"users">;
  name: string;
  profilePicture: string;
  isAdmin?: boolean;
  isSupporter?: boolean;
  };
}

export interface ReactionTypes {
  reactionId: Id<"reactions">;
  createdAt: number;
  userId: Id<"users">;
  postId: Id<"posts">;
  emoji: string;
  reactionAuthor: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isAdmin?: boolean;
    isSupporter?: boolean;
  };
}

// Props for Post Card
export interface PostCardProps {
  post: PostTypes;
  onReaction: (postId: Id<"posts">, emoji: string) => void;
  onComment: (postId: Id<"posts">) => void;
  onImagePress: (images: string[], index: number) => void;
  onReadMore: (postId: Id<"posts">) => void;
  onReactionsPress: (postId: Id<"posts">) => void;
  onUserPress?: (userId: Id<"users">, isOwner: boolean, isAdmin: boolean) => void;
  onOptionsPress?: (post: PostTypes) => void;
  showFullText?: boolean;
}

/**
 * Collection-related TypeScript types
 */

export interface CollectionTypes {
  collectionId: Id<"collections">;
  createdAt: number;
  userId: Id<"users">;
  title: string;
  postCount: number;
  isOwner: boolean;
}

export interface CollectionPostTypes {
  collectionPostId: Id<"posts">; 
  createdAt: number;
  collectionId: Id<"collections">;
  post: PostTypes;
}

// Props for Collection Card
export interface CollectionCardProps {
  collection: CollectionTypes;
  onViewPress: (collectionId: Id<"collections">) => void;
  onDeletePress?: (collectionId: Id<"collections">) => void;
  showDeleteButton?: boolean;
}

// Props for Collections Sheet
export interface CollectionsSheetProps {
  onCollectionSelect: (collectionId: Id<"collections">) => void;
  selectedCollectionId?: Id<"collections"> | null;
}
