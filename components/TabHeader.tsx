import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useQuery } from "convex/react";
import { useTheme } from "@/lib/Theme";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";

interface TabHeaderProps {
  title: string;
  onNotificationPress?: () => void;
}

export const TabHeader: React.FC<TabHeaderProps> = ({ title }) => {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Check for unread notifications
  const hasUnreadNotifications = useQuery(
    api.notifications.hasUnreadNotifications
  );

  // Navigation handlers
  const handleNotificationPress = useCallback(() => {
    router.push("/screens/notifications");
  }, []);

  const handleLetterPress = useCallback(() => {
    router.push("/screens/letters");
  }, []);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      paddingTop: insets.top + verticalScale(8),
      paddingHorizontal: scale(16),
      paddingBottom: verticalScale(16),
      borderBottomLeftRadius: scale(theme.borderRadius.xl),
      borderBottomRightRadius: scale(theme.borderRadius.xl),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "visible",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: "700",
      color: theme.colors.text,
      flex: 1,
    },
    iconButton: {
      padding: scale(8),
      borderRadius: scale(theme.borderRadius.xl),
      backgroundColor: theme.colors.background,
      position: "relative",
    },
    buttonsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    notificationDot: {
      position: "absolute",
      top: scale(6),
      right: scale(6),
      width: scale(8),
      height: scale(8),
      borderRadius: scale(theme.borderRadius.full),
      backgroundColor: theme.colors.notification,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLetterPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="mail-outline"
            size={scale(20)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { marginLeft: scale(8) }]}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={hasUnreadNotifications ? "notifications" : "notifications-outline"}
            size={scale(20)}
            color={hasUnreadNotifications ? theme.colors.error : theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
