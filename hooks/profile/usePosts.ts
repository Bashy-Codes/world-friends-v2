import { useState, useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { usePostInteractions } from "@/hooks/feed/usePostInteractions";
import { usePostActions } from "@/hooks/feed/usePostActions";

interface UsePostsProps {
  targetUserId: Id<"users">;
  skip?: boolean;
}

/**
 * Posts hook for profiles
 */
export const usePosts = ({ targetUserId, skip = false }: UsePostsProps) => {
  // Use simplified helper hooks
  const postInteractions = usePostInteractions();
  const postActions = usePostActions();

  // State for modals and interactions (owned by this hook)
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  // Paginated query for posts
  const {
    results: posts,
    status,
    loadMore,
    isLoading: loadingMore,
  } = usePaginatedQuery(
    api.feed.posts.getUserPosts,
    skip ? "skip" : { targetUserId },
    { initialNumItems: 5 }
  );

  // Loading state
  const loading = status === "LoadingFirstPage";

  // Load more posts
  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(5);
    }
  }, [status, loadMore]);

  // Comments handler - navigate to post details
  const handleComment = useCallback((postId: Id<"posts">) => {
    router.push(`/screens/post/${postId}`);
  }, []);

  // Reactions modal handler
  const handleReactionsPress = useCallback((postId: Id<"posts">) => {
    setSelectedPostId(postId);
    setShowReactionsModal(true);
  }, []);

  const closeReactionsModal = useCallback(() => {
    setShowReactionsModal(false);
  }, []);

  // Image viewer handlers
  const handleImagePress = useCallback((images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setShowImageViewer(false);
    setSelectedImages([]);
    setSelectedImageIndex(0);
  }, []);

  // Component renderers
  const renderReactionsModal = useCallback(() => {
    if (!selectedPostId) return null;
    return {
      visible: showReactionsModal,
      postId: selectedPostId,
      onClose: closeReactionsModal,
    };
  }, [selectedPostId, showReactionsModal, closeReactionsModal]);

  const renderImageViewer = useCallback(() => {
    return {
      images: selectedImages.map((uri) => ({ uri })),
      imageIndex: selectedImageIndex,
      visible: showImageViewer,
      onRequestClose: closeImageViewer,
    };
  }, [selectedImages, selectedImageIndex, showImageViewer, closeImageViewer]);

  return {
    // State
    posts: posts || [],
    loading,
    loadingMore,

    // Post interaction handlers
    handleReaction: postInteractions.handleReaction,
    handleComment,
    handleReactionsPress,
    handleImagePress,
    closeImageViewer,

    // Post action handlers
    handleReadMore: postActions.handleReadMore,
    handleUserPress: postActions.handleUserPress,
    handlePostOptionsPress: postActions.handlePostOptionsPress,

    // Pagination
    handleLoadMore,

    // Component renderers
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet: postActions.renderActionSheet,
    renderCollectionsModal: postActions.renderCollectionsModal,
    renderDeleteConfirmationModal: postActions.renderDeleteConfirmationModal,
    renderRemoveConfirmationModal: postActions.renderRemoveConfirmationModal,
  };
};
