import { Id } from "@/convex/_generated/dataModel";


export interface NotificationItem {
  notificationId: string;
  type:
    | "friend_request_sent"
    | "friend_request_accepted"
    | "friend_request_rejected"
    | "friend_removed"
    | "conversation_deleted"
    | "user_blocked"
    | "post_reaction"
    | "post_commented"
    | "comment_replied"
    | "letter_scheduled";
  createdAt: number;
  data?: { letterDeliveryDays?: number };
  sender: {
    userId: string;
    name: string;
    country: string;
  };
}

export interface UserProfile {
  // general user data
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  username: string;
  gender: "male" | "female" | "other";
  age: number;
  countryCode: string;
  isAdmin?: boolean;
  isSupporter?: boolean;
  // profile data
  aboutMe: string;
  spokenLanguageCodes: string[];
  learningLanguageCodes: string[];
  hobbies: string[];
}

export interface LetterData {
  letterId: Id<"letters">;
  senderId: Id<"users">;
  recipientId: Id<"users">;
  title: string;
  content: string;
  deliverAt: number;
  createdAt: number;
  sender?: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    gender: "male" | "female" | "other";
    age: number;
    country: string;
  };
  recipient?: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    gender: "male" | "female" | "other";
    age: number;
    country: string;
  };
  isDelivered: boolean;
  daysUntilDelivery?: number;
}

// Letter data for detail view
export interface LetterDetailData {
  letterId: Id<"letters">;
  title: string;
  content: string;
  deliverAt: number;
  createdAt: number;
  isSender: boolean;
  isDelivered: boolean;
  daysUntilDelivery?: number;
  otherUser: {
    name: string;
    country: string;
  };
}

export interface LetterCardProps {
  letter: {
    letterId: Id<"letters">;
    title: string;
    createdAt: number;
    deliverAt: number;
    isDelivered: boolean;
    daysUntilDelivery?: number;
    sender?: {
      userId: string;
      name: string;
      profilePicture: string;
      gender: "male" | "female" | "other";
      age: number;
      country: string;
    };
    recipient?: {
      userId: string;
      name: string;
      profilePicture: string;
      gender: "male" | "female" | "other";
      age: number;
      country: string;
    };
  };
  onDelete: (letterId: Id<"letters">) => void;
  onOpen: (letterId: Id<"letters">) => void;
}
