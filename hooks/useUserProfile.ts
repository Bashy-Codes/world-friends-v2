import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ActionSheetOption, ActionSheetRef } from "@/components/common/ActionSheet";
import { router } from "expo-router";
import { useTheme } from "@/lib/Theme";
import { useTranslation } from "react-i18next";

type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

export const useUserDetails = (userId: Id<"users"> | undefined) => {
  // State
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showRemoveFriendConfirmation, setShowRemoveFriendConfirmation] =
    useState(false);
  const [profileLoadingModalState, setProfileLoadingModalState] = useState<LoadingModalState>('hidden');
  const [blockLoadingModalState, setBlockLoadingModalState] = useState<LoadingModalState>('hidden');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  // Refs
  const actionSheetRef = useRef<ActionSheetRef>(null);

  // Theme
  const theme = useTheme();
  const { t } = useTranslation();

  // Convex queries and mutations
  const userProfile = useQuery(
    api.users.getUserProfile,
    userId && !isBlocking ? { userId } : "skip"
  );

  const blockUserMutation = useMutation(api.users.blockUser);
  const sendFriendRequestMutation = useMutation(
    api.friendships.sendFriendRequest
  );
  const removeFriendMutation = useMutation(api.friendships.removeFriend);

  // Loading state
  const loading = userProfile === undefined && !isBlocking;

  // Action handlers
  const handleEllipsisPress = useCallback(() => {
    actionSheetRef.current?.present();
  }, []);

  const handleBlockUser = useCallback(() => {
    setShowBlockConfirmation(true);
  }, []);

  const handleReportUser = useCallback(() => {
    actionSheetRef.current?.dismiss();
    if (userProfile) {
      router.push({
        pathname: "/screens/report",
        params: {
          type: "user",
          targetId: userProfile.userId,
          targetName: userProfile.name,
        },
      });
    }
  }, [userProfile]);

  const handleConfirmBlock = useCallback(async () => {
    if (!userId) return;

    setShowBlockConfirmation(false);
    setBlockLoadingModalState('loading');

    try {
      setIsBlocking(true);
      await blockUserMutation({ userId });

      setBlockLoadingModalState('success');

      // Navigate back after success animation
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/discover");
        }
      }, 2000);
    } catch (error) {
      setIsBlocking(false);
      setBlockLoadingModalState('error');
    }
  }, [userId, blockUserMutation, t]);

  const handleCancelBlock = useCallback(() => {
    setShowBlockConfirmation(false);
  }, []);

  const handleFriendAction = useCallback(() => {
    if (!userProfile || userProfile.hasPendingRequest) return;

    // Only handle adding friend since removing friend is handled via action sheet
    setShowRequestModal(true);
  }, [userProfile]);

  const handleSendFriendRequest = useCallback(
    async (message: string) => {
      if (!userProfile) return;

      try {
        setShowRequestModal(false);
        setIsProcessingRequest(true);
        setProfileLoadingModalState('loading');

        await sendFriendRequestMutation({
          receiverId: userProfile.userId,
          requestMessage: message,
        });

        setProfileLoadingModalState('success');
      } catch (error) {
        setProfileLoadingModalState('error');
      } finally {
        setIsProcessingRequest(false);
      }
    },
    [userProfile, sendFriendRequestMutation, t]
  );

  const handleConfirmRemoveFriend = useCallback(async () => {
    if (!userProfile) return;

    setShowRemoveFriendConfirmation(false);
    setBlockLoadingModalState('loading');

    try {
      setIsProcessingRequest(true);

      await removeFriendMutation({
        friendUserId: userProfile.userId,
      });

      setBlockLoadingModalState('success');
    } catch (error) {
      setBlockLoadingModalState('error');
    } finally {
      setIsProcessingRequest(false);
    }
  }, [userProfile, removeFriendMutation, t]);

  const handleCancelRemoveFriend = useCallback(() => {
    setShowRemoveFriendConfirmation(false);
  }, []);

  const handleCancelRequest = useCallback(() => {
    setShowRequestModal(false);
  }, []);

  // Loading modal handlers
  const handleProfileLoadingModalComplete = useCallback(() => {
    setProfileLoadingModalState('hidden');
  }, []);

  const handleBlockLoadingModalComplete = useCallback(() => {
    setBlockLoadingModalState('hidden');
  }, []);

  const actionSheetOptions: ActionSheetOption[] = useMemo(
  () => {
    const options: ActionSheetOption[] = [
      {
        id: "report-user",
        title: t("actions.reportUser"),
        icon: "flag-outline",
        color: theme.colors.error,
        onPress: handleReportUser,
      },
      {
        id: "block-user",
        title: t("actions.blockUser"),
        icon: "ban",
        color: theme.colors.error,
        onPress: handleBlockUser,
      },
    ];

    // Only add "Remove Friend" if the user is a friend
    if (userProfile?.isFriend) {
      options.unshift({
        id: "friend-action",
        title: t("actions.removeFriend"),
        icon: "person-remove",
        color: theme.colors.error,
        // dismiss sheet and show confirmation modal
        onPress: () => {
          actionSheetRef.current?.dismiss();
          setShowRemoveFriendConfirmation(true);
        },
      });
    }
    return options;
  },
  [theme.colors.error, handleReportUser, handleBlockUser, userProfile, t]
);

  return {
    // State
    userProfile,
    loading,
    showBlockConfirmation,
    isBlocking,
    showRemoveFriendConfirmation,
    profileLoadingModalState,
    blockLoadingModalState,
    showRequestModal,
    isProcessingRequest,

    // Refs
    actionSheetRef,

    // Actions
    handleEllipsisPress,
    handleBlockUser,
    handleConfirmBlock,
    handleCancelBlock,
    handleFriendAction,
    handleSendFriendRequest,
    handleConfirmRemoveFriend,
    handleCancelRemoveFriend,
    handleCancelRequest,
    handleProfileLoadingModalComplete,
    handleBlockLoadingModalComplete,

    // Options
    actionSheetOptions,
  };
};
