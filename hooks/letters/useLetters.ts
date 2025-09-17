import { useState, useCallback } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

type LetterSegmentType = "received" | "sent";

export const useLetters = () => {
  const { t } = useTranslation();
  const [activeSegment, setActiveSegment] = useState<LetterSegmentType>("received");


  // Pagination options
  const paginationOpts = { numItems: 20 };

  // Queries - only fetch data for active segment
  const receivedLettersQuery = usePaginatedQuery(
    api.communications.letters.getUserReceivedLetters,
    activeSegment === "received" ? { paginationOpts } : "skip",
    { initialNumItems: 10 }
  );

  const sentLettersQuery = usePaginatedQuery(
    api.communications.letters.getUserSentLetters,
    activeSegment === "sent" ? { paginationOpts } : "skip",
    { initialNumItems: 10 }
  );

  // Mutations
  const deleteLetterMutation = useMutation(api.communications.letters.deleteLetter);

  // Current data based on active segment
  const currentQuery = activeSegment === "received" ? receivedLettersQuery : sentLettersQuery;
  const letters = currentQuery.results || [];
  const loading = currentQuery.isLoading;
  const loadingMore = currentQuery.status === "LoadingMore";

  // Handlers
  const handleSegmentChange = useCallback((segment: LetterSegmentType) => {
    setActiveSegment(segment);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (currentQuery.status === "CanLoadMore") {
      currentQuery.loadMore(10);
    }
  }, [currentQuery]);

  const handleDeleteLetter = useCallback(async (letterId: Id<"letters">) => {
    try {
      await deleteLetterMutation({ letterId });
      Toast.show({
        type: "success",
        text1: t("successToasts.letterDeleted.text1"),
        text2: t("successToasts.letterDeleted.text2"),
      });
    } catch (error) {
      console.error("Failed to delete letter:", error);
     Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2: t("errorToasts.genericError.text2"),
      });
      return;
    }
  }, [deleteLetterMutation]);

  const handleOpenLetter = useCallback((letterId: Id<"letters">) => {
    router.push(`/screens/letter/${letterId}`);
  }, []);

  const handleComposeLetter = useCallback(() => {
    router.push("/screens/compose-letter");
  }, []);

  return {
    // State
    activeSegment,
    letters,
    loading,
    loadingMore,

    // Handlers
    handleSegmentChange,
    handleLoadMore,
    handleDeleteLetter,
    handleOpenLetter,
    handleComposeLetter,
  };
};
