import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { formatTimeAgo } from "@/utils/formatTime";
import { useRouter } from "expo-router";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/types";

import { ScreenLoading } from "@/components/ScreenLoading";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function NotificationsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const {
    notifications,
    status,
    loadMore,
    markNotificationsAsRead,
    deleteAllNotifications,

    // helper functions
    getLocalizedContent,
    getNotificationIcon,
    getNotificationColor,
    getNotificationBackgroundColor,
  } = useNotifications();

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
      const content = getLocalizedContent(item);

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
                {content}
              </Text>
               <Text
                style={[styles.timeText, { color: theme.colors.textSecondary }]}
              >
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [theme, t]
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
  },
  notificationText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    lineHeight: moderateScale(22),
  },
  timeText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    opacity: 0.8,
    alignSelf: "flex-start",
    marginBottom: verticalScale(6),
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