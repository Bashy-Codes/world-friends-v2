import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Helper hook for post interactions
 * Provides clean handlers without managing state - state is owned by components
 */
export const usePostInteractions = () => {
  const { t } = useTranslation();

  // Convex mutations
  const addPostReaction = useMutation(api.feed.interactions.addPostReaction);

  // Reaction handler
  const handleReaction = useCallback(
    async (postId: Id<"posts">, emoji: string) => {
      try {
        await addPostReaction({ postId, emoji });
      } catch (error) {
        console.error("Failed to add reaction:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError.text1"),
          text2: t("errorToasts.genericError.text2"),
          position: "top",
        });
      }
    },
    [addPostReaction, t]
  );

  return {
    // Post interaction handlers
    handleReaction,
  };
};
