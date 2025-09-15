import { useState, useCallback, useMemo, useEffect } from "react";

import { usePaginatedQuery } from "convex/react";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { type Request, type Friend } from "@/types/friendships";
import { useTranslation } from "react-i18next";

type SegmentType = "friends" | "requests";
type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

export const useFriends = () => {
  const { t } = useTranslation();

  const [selectedSegment, setSelectedSegment] = useState<SegmentType>("friends");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [loadingModalState, setLoadingModalState] = useState<LoadingModalState>('hidden');

  const {
    results: friendsData,
    status: friendsStatus,
    loadMore: loadMoreFriends,
  } = usePaginatedQuery(
    api.friendships.getUserFriends,
    {},
    { initialNumItems: 10 }
  );

  const {
    results: requestsData,
    status: requestsStatus,
    loadMore: loadMoreRequests,
  } = usePaginatedQuery(
    api.friendships.getFriendRequests,
    {},
    { initialNumItems: 10 }
  );

  const acceptRequestMutation = useMutation(api.friendships.acceptFriendRequest);
  const rejectRequestMutation = useMutation(api.friendships.rejectFriendRequest);
  const removeFriendMutation = useMutation(api.friendships.removeFriend);

  // Sort friends data by name
  const sortedFriendsData = useMemo(() => {
    return (friendsData || []).sort((a, b) => a.name.localeCompare(b.name));
  }, [friendsData]);



  const handleSegmentPress = useCallback((index: number) => {
    const newSegment = index === 0 ? "friends" : "requests";
    setSelectedSegment(newSegment);
  }, []);

  const handleMessage = useCallback((friendId: Id<"users">) => {
  }, []);

  const handleRequestPress = useCallback((request: Request) => {
    setSelectedRequest(request);
    // Request handling is done directly in the request card component
  }, []);

  const handleAcceptRequest = useCallback(async (requestId: Id<"friendRequests">) => {
    try {
      await acceptRequestMutation({ requestId });
      setSelectedRequest(null);
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  }, [acceptRequestMutation]);

  const handleDeclineRequest = useCallback(async (requestId: Id<"friendRequests">) => {
    try {
      await rejectRequestMutation({ requestId });
      setSelectedRequest(null);
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  }, [rejectRequestMutation]);

  const handleCloseSheet = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const handleViewProfile = useCallback((userId: Id<"users">) => {
    router.push(`/screens/user-profile/${userId as string}` as any);
  }, []);

  const handleRemoveFriend = useCallback((friend: Friend) => {
    setFriendToRemove(friend);
    setShowRemoveConfirmation(true);
  }, []);

  const handleConfirmRemoveFriend = useCallback(async () => {
    if (!friendToRemove) return;

    setShowRemoveConfirmation(false);
    setLoadingModalState('loading');

    try {
      setIsRemoving(true);
      await removeFriendMutation({ friendUserId: friendToRemove.userId });

      setLoadingModalState('success');
      setFriendToRemove(null);
    } catch (error) {
      console.error("Failed to remove friend:", error);
      setLoadingModalState('error');
    } finally {
      setIsRemoving(false);
    }
  }, [friendToRemove, removeFriendMutation, t]);

  const handleCancelRemoveFriend = useCallback(() => {
    setShowRemoveConfirmation(false);
    setFriendToRemove(null);
  }, []);

  // Loading modal handler
  const handleLoadingModalComplete = useCallback(() => {
    setLoadingModalState('hidden');
  }, []);

  const handleLoadMoreFriends = useCallback(() => {
    if (friendsStatus === "CanLoadMore") {
      loadMoreFriends(10);
    }
  }, [friendsStatus, loadMoreFriends]);

  const handleLoadMoreRequests = useCallback(() => {
    if (requestsStatus === "CanLoadMore") {
      loadMoreRequests(10);
    }
  }, [requestsStatus, loadMoreRequests]);

  const friendSkeletons = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ id: `skeleton-${i}` })),
    []
  );

  return {
    selectedSegment,
    friendsData: sortedFriendsData,
    requestsData: requestsData || [],
    friendsLoading: friendsStatus === "LoadingFirstPage",
    requestsLoading: requestsStatus === "LoadingFirstPage",
    friendsLoadingMore: friendsStatus === "LoadingMore",
    requestsLoadingMore: requestsStatus === "LoadingMore",
    selectedRequest,
    showRemoveConfirmation,
    friendToRemove,
    isRemoving,
    loadingModalState,
    handleSegmentPress,
    handleMessage,
    handleRequestPress,
    handleAcceptRequest,
    handleDeclineRequest,
    handleCloseSheet,
    handleViewProfile,
    handleRemoveFriend,
    handleConfirmRemoveFriend,
    handleCancelRemoveFriend,
    handleLoadingModalComplete,
    loadMoreFriends: handleLoadMoreFriends,
    loadMoreRequests: handleLoadMoreRequests,
    friendSkeletons,
  };
};
