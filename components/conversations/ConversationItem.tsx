import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { ProfilePicture } from "@/components/common/TinyProfilePicture";
import { formatTimeAgo } from "@/utils/formatTime";
import { ConversationData } from "@/types/conversations";

interface ConversationItemProps {
  conversation: ConversationData;
  onPress: (conversationGroupId: string) => void;
  onLongPress?: (conversation: ConversationData) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  onLongPress,
}) => {
  const theme = useTheme();

  // Get message preview with type prefix
  const getMessagePreview = () => {
    if (!conversation.lastMessage) return "...";

    const { lastMessage } = conversation;
    const prefix = lastMessage.isOwner ? "You: " : "";

    if (lastMessage.type === "image") {
      return `${prefix}📷`;
    }

    if (lastMessage.replyParentId) {
      return `${prefix}↩️ ${lastMessage.content || ""}`;
    }

    return `${prefix}${lastMessage.content || ""}`;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: scale(8),
      marginBottom: verticalScale(4),
      borderRadius: scale(theme.borderRadius.lg),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      overflow: "hidden",
    },
    pressable: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(14),
    },
    profileSection: {
      position: "relative",
      marginRight: scale(12),
    },
    contentSection: {
      flex: 1,
      justifyContent: "center",
    },
    userNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(4),
    },
    userName: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    verifiedIcon: {
      marginLeft: scale(4),
    },
    supporterIcon: {
      marginLeft: scale(3),
    },
    messagePreview: {
      fontSize: moderateScale(14),
      color: conversation.hasUnreadMessages
        ? theme.colors.text
        : theme.colors.textSecondary,
      fontWeight: conversation.hasUnreadMessages ? "500" : "400",
      flex: 1,
      marginRight: scale(8),
    },
    timestamp: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
      fontWeight: "500",
    },
    rightSection: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: scale(52),
      paddingVertical: verticalScale(4),
    },
    unreadIndicator: {
      marginBottom: verticalScale(4),
      width: scale(10),
      height: scale(10),
      borderRadius: scale(6),
      backgroundColor: theme.colors.notification,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.pressable}
        onPress={() => onPress(conversation.conversationGroupId)}
        onLongPress={() => onLongPress?.(conversation)}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <ProfilePicture
            profilePicture={conversation.otherUser.profilePicture}
            size={52}
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.userNameContainer}>
            <Text style={styles.userName} numberOfLines={1}>
              {conversation.otherUser.name}
            </Text>
            {conversation.otherUser.isAdmin && (
              <Ionicons
                name="shield-checkmark"
                size={scale(14)}
                color={theme.colors.primary}
                style={styles.verifiedIcon}
              />
            )}
            {conversation.otherUser.isSupporter && (
              <Ionicons
                name="heart"
                size={scale(16)}
                color={theme.colors.secondary}
                style={styles.supporterIcon}
              />
            )}
          </View>
          <Text
            style={styles.messagePreview}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getMessagePreview()}
          </Text>
        </View>

        {/* Right Section - Vertical Stack */}
        <View style={styles.rightSection}>
          <Text style={styles.timestamp}>
            {formatTimeAgo(conversation.lastMessageTime)}
          </Text>
          {conversation.hasUnreadMessages && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};