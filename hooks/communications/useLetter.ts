import { useCallback } from "react";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useLetter = (letterId: Id<"letters">) => {
  // Fetch letter data
  const letter = useQuery(api.letters.getLetter, { letterId });

  // Loading state
  const isLoading = letter === undefined;

  // Error state (letter is null when query completes but letter not found)
  const hasError = letter === null;

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // Calculate time ago for display
  const getTimeAgo = useCallback(() => {
    if (!letter) return "";

    const now = Date.now();
    const diffMs = now - letter.createdAt;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30);
      return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
    } else {
      const diffYears = Math.floor(diffDays / 365);
      return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
    }
  }, [letter]);

  // Calculate days until delivery
  const getDaysUntilDelivery = useCallback(() => {
    if (!letter || letter.isDelivered) return "";
    const now = Date.now();
    const diffMs = letter.deliverAt - now;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 ☀️" : `${days} ☀️ 🌙`;
  }, [letter]);

  return {
    // Data
    letter,

    // States
    isLoading,
    hasError,

    // Handlers
    handleBack,

    // Utilities
    getTimeAgo,
    getDaysUntilDelivery,
  };
};