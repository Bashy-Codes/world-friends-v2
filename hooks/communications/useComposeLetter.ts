import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface Friend {
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  gender: "male" | "female" | "other";
  age: number;
  country: string;
}

type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

export const useComposeLetter = () => {

  // State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [scheduleDays, setScheduleDays] = useState(1);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [loadingModalState, setLoadingModalState] = useState<LoadingModalState>('hidden');

  // Refs for modals
  const friendsPickerRef = useRef<any>(null);

  // Mutations
  const sendLetterMutation = useMutation(api.letters.scheduleLetter);

  // Validation constants
  const MIN_CONTENT_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 2000;
  const MIN_SCHEDULE_DAYS = 1;
  const MAX_SCHEDULE_DAYS = 30;

  // Computed values
  const contentLength = content.length;
  const titleLength = title.length;

  const isContentValid = contentLength >= MIN_CONTENT_LENGTH && contentLength <= MAX_CONTENT_LENGTH;
  const isTitleValid = title.trim().length > 0;
  const isFriendSelected = selectedFriend !== null;
  const isScheduleValid = scheduleDays >= MIN_SCHEDULE_DAYS && scheduleDays <= MAX_SCHEDULE_DAYS;

  const canSend = isContentValid && isTitleValid && isFriendSelected && isScheduleValid;

  const hasContent = title.trim().length > 0 || content.trim().length > 0;

  // Content handlers
  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
  }, []);

  const handleContentChange = useCallback((text: string) => {
    setContent(text);
  }, []);

  // Friend selection handlers
  const handleSelectFriend = useCallback(() => {
    friendsPickerRef.current?.present();
  }, []);

  const handleFriendSelected = useCallback((friend: Friend) => {
    setSelectedFriend(friend);
  }, []);

  const handleRemoveFriend = useCallback(() => {
    setSelectedFriend(null);
  }, []);

  // Schedule handlers
  const handleScheduleIncrease = useCallback(() => {
    setScheduleDays(prev => Math.min(prev + 1, MAX_SCHEDULE_DAYS));
  }, []);

  const handleScheduleDecrease = useCallback(() => {
    setScheduleDays(prev => Math.max(prev - 1, MIN_SCHEDULE_DAYS));
  }, []);

  const handleScheduleChange = useCallback((days: number) => {
    const clampedDays = Math.max(MIN_SCHEDULE_DAYS, Math.min(days, MAX_SCHEDULE_DAYS));
    setScheduleDays(clampedDays);
  }, []);

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (hasContent) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  }, [hasContent]);

  // Send handlers
  const handleSend = useCallback(() => {
    if (!canSend) return;
    setShowSendModal(true);
  }, [canSend]);

  const confirmSend = useCallback(async () => {
    if (!selectedFriend || !canSend) return;

    setLoadingModalState('loading');
    setShowSendModal(false);

    try {
      await sendLetterMutation({
        recipientId: selectedFriend.userId,
        title: title.trim(),
        content: content.trim(),
        daysUntilDelivery: scheduleDays,
      });

      // Show success state
      setLoadingModalState('success');

      // Reset form and navigate back after success animation
      setTitle("");
      setContent("");
      setSelectedFriend(null);
      setScheduleDays(1);

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Failed to send letter:", error);
      setLoadingModalState('error');
    }
  }, [selectedFriend, canSend, scheduleDays, title, content, sendLetterMutation]);

  const confirmDiscard = useCallback(() => {
    setTitle("");
    setContent("");
    setSelectedFriend(null);
    setScheduleDays(1);
    setShowDiscardModal(false);
    router.back();
  }, []);

  // Modal handlers
  const closeSendModal = useCallback(() => {
    setShowSendModal(false);
  }, []);

  const closeDiscardModal = useCallback(() => {
    setShowDiscardModal(false);
  }, []);

  const handleLoadingModalComplete = useCallback(() => {
    setLoadingModalState('hidden');
  }, []);

  // Utility functions
  const getCounterColor = useCallback((theme: any) => {
    if (contentLength < MIN_CONTENT_LENGTH) {
      return theme.colors.error;
    } else if (contentLength > MAX_CONTENT_LENGTH * 0.9) {
      return theme.colors.warning;
    }
    return theme.colors.success;
  }, [contentLength]);

  const getScheduleText = useCallback(() => {
    if (scheduleDays === 1) {
      return "Tomorrow";
    } else {
      return `In ${scheduleDays} days`;
    }
  }, [scheduleDays]);

  return {
    // State
    title,
    content,
    selectedFriend,
    scheduleDays,
    showDiscardModal,
    showSendModal,
    loadingModalState,

    // Refs
    friendsPickerRef,

    // Computed values
    contentLength,
    titleLength,
    canSend,
    hasContent,
    isContentValid,
    isTitleValid,
    isFriendSelected,
    isScheduleValid,

    // Constants
    MIN_CONTENT_LENGTH,
    MAX_CONTENT_LENGTH,

    // Handlers
    handleTitleChange,
    handleContentChange,
    handleSelectFriend,
    handleFriendSelected,
    handleRemoveFriend,
    handleScheduleIncrease,
    handleScheduleDecrease,
    handleScheduleChange,
    handleBack,
    handleSend,
    confirmSend,
    confirmDiscard,
    closeSendModal,
    closeDiscardModal,
    handleLoadingModalComplete,

    // Utility functions
    getCounterColor,
    getScheduleText,
  };
};
