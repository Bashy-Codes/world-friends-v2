import { useState, useRef, useCallback } from "react";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { uploadPostImageToR2 } from "@/utils/uploadImages";
import { useTranslation } from "react-i18next";
import { CollectionsModalRef } from "@/components/feed/CollectionsModal";
import { ImagePickerSheetRef } from "@/components/common/ImagePickerSheet";

type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

export const useCreatePost = () => {
  const { t } = useTranslation();

  // State
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [loadingModalState, setLoadingModalState] = useState<LoadingModalState>('hidden');
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<Id<"collections"> | null>(null);

  // Convex mutations
  const createPost = useMutation(api.feed.posts.createPost);
  const updatePostImages = useMutation(api.feed.posts.updatePostImages);
  const generatePostUploadUrl = useMutation(api.storage.generatePostUploadUrl);
  const syncMetadata = useMutation(api.storage.syncMetadata);

  // Refs
  const imagePickerRef = useRef<ImagePickerSheetRef>(null);
  const collectionsModalRef = useRef<CollectionsModalRef>(null);
  const tagsPickerRef = useRef<any>(null);

  // Computed values
  const characterCount = content.length;
  const canPost = content.trim().length > 0 && selectedTags.length > 0;
  const hasChanges = content.trim().length > 0 || images.length > 0 || selectedTags.length > 0;

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  }, [hasChanges]);

  const confirmDiscard = useCallback(() => {
    setContent("");
    setImages([]);
    setSelectedTags([]);
    setSelectedCollectionId(null);
    setShowDiscardModal(false);
    router.back();
  }, []);

  // Image handling
  const handleAddImage = useCallback(() => {
    imagePickerRef.current?.present();
  }, []);

  const handleImageSelected = useCallback((imageUri: string) => {
    setImages((prev) => {
      if (prev.length < 3) {
        return [...prev, imageUri];
      }
      return prev;
    });
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Collection selection handlers
  const openCollectionsSheet = useCallback(() => {
    collectionsModalRef.current?.present();
  }, []);

  const handleAddToCollectionPress = useCallback(() => {
    openCollectionsSheet();
  }, [openCollectionsSheet]);

  const handleCollectionSelect = useCallback(
    (collectionId: Id<"collections">) => {
      setSelectedCollectionId(collectionId);
      collectionsModalRef.current?.dismiss();
    },
    []
  );

  const handleRemoveCollection = useCallback(() => {
    setSelectedCollectionId(null);
  }, []);

  // Tags handlers
  const handleAddTagsPress = useCallback(() => {
    tagsPickerRef.current?.present();
  }, []);

  const handleTagsSelectionChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleTagsConfirm = useCallback(() => {
    // Tags are already updated via handleTagsSelectionChange
  }, []);

  const handleRemoveTag = useCallback((tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  }, []);

  // Modal handlers
  const closeDiscardModal = useCallback(() => {
    setShowDiscardModal(false);
  }, []);

  const closePostModal = useCallback(() => {
    setShowPostModal(false);
  }, []);

  // Post creation handlers
  const handlePost = useCallback(() => {
    if (!canPost) return;
    setShowPostModal(true);
  }, [canPost]);

  const confirmPost = useCallback(async () => {
    if (!canPost) return;

    try {
      setLoadingModalState('loading');
      setShowPostModal(false);

      // Create the post first (without images)
      const result = await createPost({
        content: content.trim(),
        images: undefined,
        collectionId: selectedCollectionId || undefined,
        tags: selectedTags,
      });

      let imageKeys: string[] = [];

      // Upload images if present and update the post
      if (images.length > 0 && result.postId) {
        for (let i = 0; i < images.length; i++) {
          const uploadResult = await uploadPostImageToR2(
            images[i],
            result.postId,
            i + 1, // Image index (1-based)
            generatePostUploadUrl,
            syncMetadata
          );

          if (!uploadResult || !uploadResult.key) {
            throw new Error(`Failed to upload image ${i + 1}`);
          }

          imageKeys.push(uploadResult.key);
        }

        // Update the post with all image keys
        await updatePostImages({
          postId: result.postId,
          imageKeys,
        });
      }

      // Show success state
      setLoadingModalState('success');

      // Reset form
      setContent("");
      setImages([]);
      setSelectedTags([]);
      setSelectedCollectionId(null);

      // Navigate back to feed after success animation
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Post creation failed:", error);
      setLoadingModalState('error');
    }
  }, [
    canPost,
    content,
    images,
    createPost,
    generatePostUploadUrl,
    syncMetadata,
    updatePostImages,
    selectedCollectionId,
    selectedTags,
  ]);

  // Loading modal handlers
  const handleLoadingModalComplete = useCallback(() => {
    setLoadingModalState('hidden');
  }, []);

  // Utility functions
  const getCounterColor = useCallback(
    (theme: any) => {
      if (characterCount >= 10) {
        return theme.colors.success;
      }
      return theme.colors.textMuted;
    },
    [characterCount]
  );

  return {
    // State
    content,
    images,
    selectedTags,
    showDiscardModal,
    showPostModal,
    loadingModalState,
    selectedCollectionId,

    // Refs
    imagePickerRef,
    collectionsModalRef,
    tagsPickerRef,

    // Computed values
    characterCount,
    canPost,
    hasChanges,

    // Content handlers
    setContent,

    // Navigation handlers
    handleBack,

    // Post creation handlers
    handlePost,
    confirmPost,
    confirmDiscard,

    // Image handlers
    handleAddImage,
    handleImageSelected,
    handleRemoveImage,

    // Collection handlers
    openCollectionsSheet,
    handleAddToCollectionPress,
    handleCollectionSelect,
    handleRemoveCollection,

    // Tags handlers
    handleAddTagsPress,
    handleTagsSelectionChange,
    handleTagsConfirm,
    handleRemoveTag,

    // Modal handlers
    closeDiscardModal,
    closePostModal,
    handleLoadingModalComplete,

    // Utility functions
    getCounterColor,
  };
};
