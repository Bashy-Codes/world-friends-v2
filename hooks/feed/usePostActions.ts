import { useCallback, useRef, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useTheme } from "@/lib/Theme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PostTypes, CollectionPostTypes } from "@/types/feed";
import { ActionSheetOption, ActionSheetRef } from "@/components/common/ActionSheet";
import { CollectionsModalRef } from "@/components/feed/CollectionsModal";

/**
 * Helper hook for post actions
 * Provides clean handlers without managing state - state is owned by components
 */
export const usePostActions = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State for modals and sheets
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostTypes | null>(null);
  const [selectedCollectionPost, setSelectedCollectionPost] = useState<CollectionPostTypes | null>(null);

  // Refs for sheets and modals
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const collectionsModalRef = useRef<CollectionsModalRef>(null);

  // Convex mutations
  const deletePost = useMutation(api.feed.posts.deletePost);
  const addPostToCollection = useMutation(api.feed.collections.addPostToCollection);
  const removePostFromCollection = useMutation(api.feed.collections.removePostFromCollection);


/**
 * Operations handlers
 * Takes parameters for post and collection post data
 */

  // Delete post handler 
  const handleDeletePost = useCallback(async (postId: Id<"posts">, onSuccess?: () => void) => {
    try {
      await deletePost({ postId });

      Toast.show({
        type: "success",
        text1: t("successToasts.postDeleted.text1"),
        text2: t("successToasts.postDeleted.text2"),
        position: "top",
      });

      // Call optional callback for post deletion
      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete post:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2: t("errorToasts.genericError.text2"),
        position: "top",
      });
    }
  }, [deletePost, t]);

  // Add to collection handler
  const handleAddToCollection = useCallback(
    async (postId: Id<"posts">, collectionId: Id<"collections">, onSuccess?: () => void) => {
      try {
        await addPostToCollection({ collectionId, postId });

        Toast.show({
          type: "success",
          text1: t("successToasts.postAddedToCollection.text1"),
          text2: t("successToasts.postAddedToCollection.text2"),
          position: "top",
        });

        onSuccess?.();
      } catch (error) {
        console.error("Failed to add to collection:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.postAlreadyInCollection.text1"),
          text2: t("errorToasts.postAlreadyInCollection.text2"),
          position: "top",
        });
      }
    },
    [addPostToCollection, t]
  );

  // Remove from collection handler
  const handleRemoveFromCollection = useCallback(
    async (postId: Id<"posts">, collectionId: Id<"collections">, onSuccess?: () => void) => {
      try {
        await removePostFromCollection({ postId });

        Toast.show({
          type: "success",
          text1: t("successToasts.postRemovedFromCollection.text1"),
          text2: t("successToasts.postRemovedFromCollection.text2"),
          position: "top",
        });

        onSuccess?.();
      } catch (error) {
        console.error("Failed to remove from collection:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError.text1"),
          text2: t("errorToasts.genericError.text2"),
          position: "top",
        });
      }
    },
    [removePostFromCollection, t]
  );

  // Report post handler 
  const handleReportPress = useCallback((postId: Id<"posts">, content: string, authorName: string) => {
    router.push({
      pathname: "/screens/report",
      params: {
        type: "post",
        postId,
        postContent: content,
        postAuthor: authorName,
      },
    });
  }, []);

  // Post options handler 
  const handlePostOptionsPress = useCallback((post: PostTypes) => {
    setSelectedPost(post);
    actionSheetRef.current?.present();
  }, []);

  // Collection post options handler - for posts in collections
  const handleCollectionPostOptionsPress = useCallback((collectionPost: CollectionPostTypes) => {
    setSelectedCollectionPost(collectionPost);
    actionSheetRef.current?.present();
  }, []);

  // Action handlers for post options
  const onDeletePress = useCallback(() => {
    actionSheetRef.current?.dismiss();
    setShowDeleteModal(true);
  }, []);

  const onAddToCollectionPress = useCallback(() => {
    actionSheetRef.current?.dismiss();
    collectionsModalRef.current?.present();
  }, []);

  const onRemoveFromCollectionPress = useCallback(() => {
    actionSheetRef.current?.dismiss();
    setShowRemoveModal(true);
  }, []);

  const onReportPress = useCallback(() => {
    actionSheetRef.current?.dismiss();

    if (selectedPost) {
      handleReportPress(selectedPost.postId, selectedPost.content, selectedPost.postAuthor.name);
    } else if (selectedCollectionPost) {
      handleReportPress(
        selectedCollectionPost.post.postId,
        selectedCollectionPost.post.content,
        selectedCollectionPost.post.postAuthor.name
      );
    }
  }, [selectedPost, selectedCollectionPost, handleReportPress]);

  // Modal handlers
  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedPost(null);
    setSelectedCollectionPost(null);
  }, []);

  const closeRemoveModal = useCallback(() => {
    setShowRemoveModal(false);
    setSelectedPost(null);
    setSelectedCollectionPost(null);
  }, []);

  const confirmDeletePost = useCallback(async () => {
    if (selectedPost) {
      await handleDeletePost(selectedPost.postId);
      closeDeleteModal();
    }
  }, [selectedPost, handleDeletePost, closeDeleteModal]);

  const confirmRemoveFromCollection = useCallback(async () => {
    if (selectedCollectionPost) {
      await handleRemoveFromCollection(
        selectedCollectionPost.post.postId,
        selectedCollectionPost.collectionId
      );
      closeRemoveModal();
    }
  }, [selectedCollectionPost, handleRemoveFromCollection, closeRemoveModal]);

  const handleCollectionSelect = useCallback(async (collectionId: Id<"collections">) => {
    if (selectedPost) {
      await handleAddToCollection(selectedPost.postId, collectionId);
      collectionsModalRef.current?.dismiss();
      setSelectedPost(null);
    }
  }, [selectedPost, handleAddToCollection]);

  // Generate action sheet options based on selected post/collection post
  const getActionSheetOptions = useCallback((): ActionSheetOption[] => {
    const options: ActionSheetOption[] = [];

    if (selectedPost) {
      // Regular post options
      if (selectedPost.isOwner) {
        // Own post options
        options.push({
          id: "addToCollection",
          title: t("actions.addToCollection"),
          icon: "bookmark-outline",
          color: theme.colors.info,
          onPress: onAddToCollectionPress,
        });
        options.push({
          id: "delete",
          title: t("actions.deletePost"),
          icon: "trash-outline",
          color: theme.colors.error,
          onPress: onDeletePress,
        });
      } else if (!selectedPost.postAuthor.isAdmin) {
        // Other user's post (not admin)
        options.push({
          id: "report",
          title: t("actions.reportPost"),
          icon: "flag-outline",
          color: theme.colors.error,
          onPress: onReportPress,
        });
      }
    } else if (selectedCollectionPost) {
      // Collection post options
      if (selectedCollectionPost.post.isOwner) {
        // Own post options in collection
        options.push({
          id: "removeFromCollection",
          title: t("actions.removeFromCollection"),
          icon: "remove-circle-outline",
          color: theme.colors.error,
          onPress: onRemoveFromCollectionPress,
        });
        options.push({
          id: "delete",
          title: t("actions.deletePost"),
          icon: "trash-outline",
          color: theme.colors.error,
          onPress: onDeletePress,
        });
      } else if (!selectedCollectionPost.post.postAuthor.isAdmin) {
        // Other user's post in collection (not admin)
        options.push({
          id: "report",
          title: t("actions.reportPost"),
          icon: "flag-outline",
          color: theme.colors.error,
          onPress: onReportPress,
        });
      }
    }

    return options;
  }, [selectedPost, selectedCollectionPost, t, theme.colors, onDeletePress, onAddToCollectionPress, onRemoveFromCollectionPress, onReportPress]);

  // Navigation handlers 
  const handleReadMore = useCallback((postId: Id<"posts">) => {
    router.push(`/screens/post/${postId}`);
  }, []);

  const handleUserPress = useCallback(
    (userId: Id<"users">, isOwner: boolean, isAdmin: boolean) => {
      if (isAdmin || isOwner) {
        // Do nothing for own/admin posts
        return;
      } else {
        // Navigate to user details for other users
        router.push(`/screens/user-profile/${userId}`);
      }
    },
    []
  );

  // Component renderers
  const renderActionSheet = useCallback(() => {
    const options = getActionSheetOptions();
    if (options.length === 0) return null;

    return {
      ref: actionSheetRef,
      options,
    };
  }, [getActionSheetOptions]);

  const renderCollectionsModal = useCallback(() => {
    return {
      ref: collectionsModalRef,
      onCollectionSelect: handleCollectionSelect,
    };
  }, [handleCollectionSelect]);

  const renderDeleteConfirmationModal = useCallback(() => {
    return {
      visible: showDeleteModal,
      icon: "trash-outline",
      iconColor: theme.colors.error,
      description: t("confirmation.deletePost.description"),
      confirmButtonColor: theme.colors.error,
      onConfirm: confirmDeletePost,
      onCancel: closeDeleteModal,
    };
  }, [showDeleteModal, t, theme.colors.error, confirmDeletePost, closeDeleteModal]);

  const renderRemoveConfirmationModal = useCallback(() => {
    return {
      visible: showRemoveModal,
      icon: "remove-circle-outline",
      iconColor: theme.colors.error,
      description: t("confirmation.removeFromCollection.description"),
      confirmButtonColor: theme.colors.error,
      onConfirm: confirmRemoveFromCollection,
      onCancel: closeRemoveModal,
    };
  }, [showRemoveModal, t, theme.colors.error, confirmRemoveFromCollection, closeRemoveModal]);

  return {
    // Post action handlers
    handleReadMore,
    handleUserPress,
    handleDeletePost,
    handleAddToCollection,
    handleRemoveFromCollection,
    handleReportPress,

    // Post options handlers
    handlePostOptionsPress,
    handleCollectionPostOptionsPress,

    // Component renderers
    renderActionSheet,
    renderCollectionsModal,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  };
};
