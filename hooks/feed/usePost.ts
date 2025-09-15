import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { usePostInteractions } from "@/hooks/feed/usePostInteractions";
import { usePostActions } from "@/hooks/feed/usePostActions";

export const usePost = (postId: Id<"posts">) => {
  // Convex hooks
  const post = useQuery(api.feed.posts.getPostDetails, { postId });

  // Loading state
  const loading = post === undefined;

  // Use simplified helper hooks
  const postInteractions = usePostInteractions();
  const postActions = usePostActions();

  // State for modals and interactions (owned by this hook)
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  // Custom handlers for single post context
  const handleReaction = useCallback((postId: Id<"posts">, emoji: string) => {
    postInteractions.handleReaction(postId, emoji);
  }, [postInteractions]);

  const handleComment = useCallback(() => {
    // No-op since comments are handled directly in post details screen
  }, []);

  const handleReactionsPress = useCallback(() => {
    if (post) {
      setSelectedPostId(post.postId);
      setShowReactionsModal(true);
    }
  }, [post]);

  const closeReactionsModal = useCallback(() => {
    setShowReactionsModal(false);
  }, []);

  const handleUserPress = useCallback(() => {
    if (!post) return;
    postActions.handleUserPress(post.postAuthor.userId, post.isOwner, post.postAuthor.isAdmin || false);
  }, [post, postActions]);

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
    post,
    loading,

    // Post interaction handlers
    handleReaction,
    handleComment,
    handleReactionsPress,
    handleImagePress,
    handleUserPress,
    closeImageViewer,

    // Post action handlers
    handlePostOptionsPress: postActions.handlePostOptionsPress,

    // Action handlers
    handleDeletePost: (onSuccess?: () => void) => {
      if (post) {
        postActions.handleDeletePost(post.postId, onSuccess || (() => router.back()));
      }
    },

    // Component renderers
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet: postActions.renderActionSheet,
    renderCollectionsModal: postActions.renderCollectionsModal,
    renderDeleteConfirmationModal: postActions.renderDeleteConfirmationModal,
    renderRemoveConfirmationModal: postActions.renderRemoveConfirmationModal,
  };
};
