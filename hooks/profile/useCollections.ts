import { useState, useCallback } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useTheme } from "@/lib/Theme";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UseCollectionsProps {
  targetUserId: Id<"users">;
  skip?: boolean;
}

/**
 * Collections hook for profiles
 */

export const useCollections = ({
  targetUserId,
  skip = false,
}: UseCollectionsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Convex hooks
  const deleteCollectionMutation = useMutation(api.feed.collections.deleteCollection);
  const createCollectionMutation = useMutation(api.feed.collections.createCollection);

  // Paginated query for collections
  const {
    results: collections,
    status,
    loadMore,
    isLoading: loadingMore,
  } = usePaginatedQuery(
    api.feed.collections.getUserCollections,
    skip ? "skip" : { targetUserId },
    { initialNumItems: 10 }
  );

  // Loading state
  const areCollectionsLoading = status === "LoadingFirstPage";

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<Id<"collections"> | null>(null);


  // Collection handlers

  const handleCreateCollection = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCreateCollectionSubmit = useCallback(async (title: string) => {
    try {
      await createCollectionMutation({
        title: title.trim(),
      });

      Toast.show({
        type: "success",
        text1: t("successToasts.collectionCreated.text1"),
        text2: t("successToasts.collectionCreated.text2"),
        position: "top",
      });

      setShowCreateModal(false);
    } catch (error: any) {
      console.error("Failed to create collection:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2: t("errorToasts.genericError.text2"),
        position: "top",
      });
    }
  }, [createCollectionMutation, t]);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);


  const handleViewCollection = useCallback(
    (collectionId: Id<"collections">) => {
      router.push(`/screens/collection/${collectionId}`);
    },
    []
  );

  const handleDeleteCollection = useCallback(
    (collectionId: Id<"collections">) => {
      setSelectedCollectionId(collectionId);
      setShowDeleteModal(true);
    },
    []
  );

  const confirmDeleteCollection = useCallback(async () => {
    if (!selectedCollectionId) return;

    try {
      await deleteCollectionMutation({ collectionId: selectedCollectionId });
      Toast.show({
        type: "success",
        text1: t("successToasts.collectionDeleted.text1"),
        text2: t("successToasts.collectionDeleted.text2"),
        position: "top",
      });
      setShowDeleteModal(false);
      setSelectedCollectionId(null);
    } catch (error) {
      console.error("Failed to delete collection:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2: t("errorToasts.genericError.text2"),
        position: "top",
      });
    }
  }, [selectedCollectionId, deleteCollectionMutation, t]);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedCollectionId(null);
  }, []);

  // Load more collections
  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  // Render functions
  const renderDeleteConfirmationModal = useCallback(() => {
    return {
      visible: showDeleteModal,
      icon: "trash-outline",
      iconColor: theme.colors.error,
      description: t("confirmation.deleteCollection.description"),
      confirmButtonColor: theme.colors.error,
      onConfirm: confirmDeleteCollection,
      onCancel: closeDeleteModal,
    };
  }, [showDeleteModal, t, confirmDeleteCollection, closeDeleteModal]);

  const renderCreateCollectionModal = useCallback(() => {
    return {
      visible: showCreateModal,
      title: t("collections.create.title"),
      inputPlaceholder: t("collections.create.placeholder"),
      maxCharacters: 30,
      onSubmit: handleCreateCollectionSubmit,
      onCancel: closeCreateModal,
      submitIcon: "add",
    };
  }, [showCreateModal, t, handleCreateCollectionSubmit, closeCreateModal]);

  return {
    // State
    collections: collections || [],
    areCollectionsLoading,
    loadingMore,
    showDeleteModal,
    showCreateModal,

    // Collection handlers
    handleViewCollection,
    handleDeleteCollection,
    handleCreateCollection,
    handleCreateCollectionSubmit,
    confirmDeleteCollection,
    closeDeleteModal,
    closeCreateModal,

    // Pagination
    handleLoadMore,

    // Component renderers
    renderDeleteConfirmationModal,
    renderCreateCollectionModal,
  };
};
