import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePaginatedQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api } from "@/convex/_generated/api";
import { formatTimeAgo } from "@/utils/formatTime";
import { useRouter } from "expo-router";
import { ScreenLoading } from "@/components/ScreenLoading";

interface NotificationItem {
  notificationId: string;
  type:
  | "friend_request_sent"
  | "friend_request_accepted"
  | "friend_request_rejected"
  | "friend_removed"
  | "conversation_deleted"
  | "user_blocked"
  | "post_reaction"
  | "post_commented"
  | "comment_replied"
  | "letter_scheduled";
  content: string;
  createdAt: number;
  sender: {
    userId: string;
    name: string;
  };
}

const getNotificationIcon = (type: NotificationItem["type"]) => {
  switch (type) {
    case "friend_request_sent":
      return "person-add-outline";
    case "friend_request_accepted":
      return "checkmark-circle";
    case "friend_request_rejected":
      return "close-circle";
    case "friend_removed":
      return "person-remove-outline";
    case "conversation_deleted":
      return "chatbubble-ellipses-outline";
    case "user_blocked":
      return "ban-outline";
    case "post_reaction":
      return "happy";
    case "post_commented":
      return "chatbubble-outline";
    case "comment_replied":
      return "arrow-undo-outline";
    case "letter_scheduled":
      return "mail-outline";
    default:
      return "notifications-outline";
  }
};

const getNotificationColor = (type: NotificationItem["type"], theme: any) => {
  switch (type) {
    case "friend_request_sent":
      return theme.colors.primary;
    case "friend_request_accepted":
      return theme.colors.success;
    case "friend_request_rejected":
      return theme.colors.error;
    case "friend_removed":
      return theme.colors.warning;
    case "conversation_deleted":
      return "#9C27B0";
    case "user_blocked":
      return theme.colors.error;
    case "post_reaction":
      return theme.colors.primary;
    case "post_commented":
      return "#2196F3"; // Blue for comments
    case "comment_replied":
      return "#FF9800"; // Orange for replies
    case "letter_scheduled":
      return "#8E24AA"; // Purple for letters
    default:
      return theme.colors.primary;
  }
};

const getNotificationBackgroundColor = (
  type: NotificationItem["type"],
  theme: any
) => {
  switch (type) {
    case "friend_request_sent":
      return `${theme.colors.primary}15`;
    case "friend_request_accepted":
      return `${theme.colors.success}15`;
    case "friend_request_rejected":
      return `${theme.colors.error}15`;
    case "friend_removed":
      return `${theme.colors.warning}15`;
    case "conversation_deleted":
      return "#9C27B015";
    case "user_blocked":
      return `${theme.colors.error}15`;
    case "post_reaction":
      return `${theme.colors.primary}15`;
    case "post_commented":
      return "#2196F315";
    case "comment_replied":
      return "#FF980015";
    case "letter_scheduled":
      return "#8E24AA15";
    default:
      return `${theme.colors.primary}15`;
  }
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // Convex queries and mutations
  const {
    results: notifications,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.userManagement.getUserNotifications,
    {},
    { initialNumItems: 10 }
  );

  const markNotificationsAsRead = useMutation(
    api.userManagement.markNotificationsAsRead
  );
  const deleteAllNotifications = useMutation(
    api.userManagement.deleteAllNotifications
  );

  // Mark notifications as read when screen loads
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await markNotificationsAsRead();
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    };

    if (notifications && notifications.length > 0) {
      markAsRead();
    }
  }, [notifications, markNotificationsAsRead]);

  const handleDeleteAll = useCallback(async () => {
    try {
      await deleteAllNotifications();
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    }
  }, [deleteAllNotifications]);

  const renderNotificationItem = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const iconName = getNotificationIcon(item.type);
      const iconColor = getNotificationColor(item.type, theme);
      const backgroundColor = getNotificationBackgroundColor(item.type, theme);

      return (
        <View
          style={[
            styles.notificationItem,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.notificationContent}>
            {/* Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor }]}>
              <Ionicons
                name={iconName as any}
                size={moderateScale(24)}
                color={iconColor}
              />
            </View>

            {/* Content */}
            <View style={styles.textContent}>
              <Text
                style={[styles.notificationText, { color: theme.colors.text }]}
              >
                {item.content}
              </Text>
              <Text
                style={[styles.timeText, { color: theme.colors.textSecondary }]}
              >
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>

            {/* Action Indicator */}
            <View style={styles.actionIndicator}>
              <View
                style={[styles.statusDot, { backgroundColor: iconColor }]}
              />
            </View>
          </View>
        </View>
      );
    },
    [theme]
  );

  const keyExtractor = useCallback(
    (item: NotificationItem) => item.notificationId,
    []
  );

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") {
    return <ScreenLoading />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        title={t("screenTitles.notifications")}
        onBack={() => router.back()}
        rightComponent="button"
        rightButtonText={t("notifications.clearAll")}
        onRightPress={handleDeleteAll}
      />

      <FlatList
        data={notifications || []}
        renderItem={renderNotificationItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={moderateScale(48)}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {t("emptyState.notifications")}
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t("notifications.emptySubtext")}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(8),
  },
  notificationItem: {
    marginBottom: verticalScale(12),
    borderRadius: moderateScale(16),
    padding: scale(20),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  textContent: {
    flex: 1,
    marginRight: scale(12),
  },
  notificationText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(6),
  },
  timeText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    opacity: 0.8,
  },
  actionIndicator: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: verticalScale(120),
    paddingHorizontal: scale(32),
  },
  emptyIconContainer: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  emptyText: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: moderateScale(15),
    textAlign: "center",
    lineHeight: moderateScale(22),
    opacity: 0.8,
  },
});
