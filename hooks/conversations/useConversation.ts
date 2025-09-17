import {
  useRef,
  useCallback,
  useEffect,
  useState
} from "react";
import { AppState, AppStateStatus, BackHandler, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useConvex } from "convex/react";
import { ConversationInfo, MessageData } from "@/types/conversations";


/**
 * Hook for managing conversation screen logic
 *
 * This hook provides:
 * - Conversation info fetching and state management
 * - Message list management with scroll functionality
 * - Message and conversation actions with confirmation modals
 * - App state and navigation handling
 * - Mark as read functionality
 */
export const useConversation = (conversationGroupId: string) => {
  const { t } = useTranslation();
  const router = useRouter();
  const convex = useConvex();

  // Refs
  const flatListRef = useRef<FlatList<MessageData>>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // State
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [deleteMessageModalVisible, setDeleteMessageModalVisible] = useState(false);

  // Message Actions State
  const [replyingTo, setReplyingTo] = useState<MessageData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Mutations
  const markAsReadMutation = useMutation(api.communications.conversations.markAsRead);
  const deleteMessageMutation = useMutation(api.communications.conversations.deleteMessage);
  const sendMessageMutation = useMutation(api.communications.conversations.sendMessage);

  // ===== MESSAGE ACTIONS =====

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: Id<"messages">) => {
      try {
        setIsDeleting(messageId);
        await deleteMessageMutation({ messageId });
      } catch (error) {
        console.error("Failed to delete message:", error);
      } finally {
        setIsDeleting(null);
      }
    },
    [deleteMessageMutation]
  );

  // Start reply
  const startReply = useCallback((message: MessageData) => {
    setReplyingTo(message);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Send text message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        setIsSending(true);

        await sendMessageMutation({
          conversationGroupId,
          content: content.trim(),
          type: "text",
          replyParentId: replyingTo?.messageId,
        });

        if (replyingTo) {
          setReplyingTo(null);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError.text1"),
          text2: t("errorToasts.genericError.text2"),
          position: "top",
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversationGroupId, replyingTo, sendMessageMutation]
  );

  // Send image message
  const sendImage = useCallback(
    async (imageId: Id<"_storage">) => {
      try {
        setIsSending(true);
        await sendMessageMutation({
          conversationGroupId,
          type: "image",
          imageId,
        });
      } catch (error) {
        console.error("Failed to send image:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError.text1"),
          text2: t("errorToasts.genericError.text2"),
          position: "top",
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversationGroupId, sendMessageMutation]
  );


  // ===== CONVERSATION INFO =====

  // Fetch conversation info
  useEffect(() => {
    async function fetchConversationInfo() {
      try {
        setIsLoadingConversation(true);
        setError(null);
        const result = await convex.query(api.communications.conversations.getConversationInfo, {
          conversationGroupId,
        });
        setConversationInfo(result);
      } catch (err) {
        console.error("Failed to fetch conversation info:", err);
        setError("Failed to load conversation info");
      } finally {
        setIsLoadingConversation(false);
      }
    }

    fetchConversationInfo();
  }, [conversationGroupId, convex]);

  // Mark messages as read when app goes to background or inactive
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current === "active" &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        markAsReadMutation({ conversationGroupId }).catch((error) => {
          console.error("Failed to mark conversation as read:", error);
        });
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [conversationGroupId, markAsReadMutation]);

  // Mark messages as read on hardware back button press
  useEffect(() => {
    const handleBackPress = () => {
      markAsReadMutation({ conversationGroupId }).catch((error) => {
        console.error("Failed to mark conversation as read:", error);
      });
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, [conversationGroupId, markAsReadMutation, router]);

  // ===== SCROLL MANAGEMENT =====

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 0, animated: true });
    }
  }, []);

  // Navigation handlers
  const handleBackPress = useCallback(() => {
    markAsReadMutation({ conversationGroupId }).catch((error) => {
      console.error("Failed to mark conversation as read:", error);
    });
    router.back();
  }, [router, conversationGroupId, markAsReadMutation]);

  // Message handlers
  const handleMessageLongPress = useCallback((message: MessageData) => {
    setSelectedMessage(message);
    setActionModalVisible(true);
  }, []);

  const handleReply = useCallback(
    (message: MessageData) => {
      startReply(message);
    },
    [startReply]
  );

  const handleDeleteMessage = useCallback(
    (message: MessageData) => {
      setSelectedMessage(message);
      setDeleteMessageModalVisible(true);
    },
    []
  );

  const confirmDeleteMessage = useCallback(async () => {
    if (selectedMessage) {
      await deleteMessage(selectedMessage.messageId);
      setDeleteMessageModalVisible(false);
      setSelectedMessage(null);
    }
  }, [selectedMessage, deleteMessage]);

  // ===== MESSAGE HANDLERS =====

  // Handle send message
  const handleSendMessage = useCallback((content: string) => {
    sendMessage(content);
  }, [sendMessage]);

  // Handle send image
  const handleSendImage = useCallback((imageId: Id<"_storage">) => {
    sendImage(imageId);
  }, [sendImage]);


  return {
    // Data
    conversationInfo,
    selectedMessage,
    replyingTo,

    // Loading states
    isLoadingConversation,
    isSending,
    isDeleting,
    error,

    // Modal states
    actionModalVisible,
    deleteMessageModalVisible,

    // Refs
    flatListRef,

    // Handlers
    handleBackPress,
    handleMessageLongPress,
    handleReply,
    handleDeleteMessage,
    handleSendMessage,
    handleSendImage,
    scrollToBottom,

    // Modal handlers
    setActionModalVisible,
    setDeleteMessageModalVisible,
    confirmDeleteMessage,

    // Message actions
    startReply,
    cancelReply,
    sendMessage,
    sendImage,
    deleteMessage,
  };
};
