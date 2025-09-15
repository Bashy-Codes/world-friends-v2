import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { ProfilePicture } from "@/components/common/TinyProfilePicture";
import { Id } from "@/convex/_generated/dataModel";

interface ConversationHeaderProps {
  otherUser: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isAdmin?: boolean;
    isSupporter?: boolean;
  };
  onBackPress: () => void;
  onOptionsPress: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  otherUser,
  onBackPress,
  onOptionsPress,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top + verticalScale(8),
          paddingHorizontal: scale(16),
          paddingBottom: verticalScale(12),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomLeftRadius: scale(theme.borderRadius.xl),
          borderBottomRightRadius: scale(theme.borderRadius.xl),
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        },
        leftSection: {
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        },
        backButton: {
          padding: scale(8),
          borderRadius: scale(theme.borderRadius.full),
          backgroundColor: theme.colors.background,
          marginRight: scale(12),
        },
        profileSection: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        },
        profilePicture: {
          marginRight: scale(12),
        },
        userInfo: {
          flex: 1,
        },
        userNameContainer: {
          flexDirection: "row",
          alignItems: "center",
        },
        userName: {
          fontSize: moderateScale(18),
          fontWeight: "600",
          color: theme.colors.text,
        },
        verifiedIcon: {
          marginLeft: scale(5),
        },
        supporterIcon: {
          marginLeft: scale(5),
        },
        rightSection: {
          marginLeft: scale(12),
        },
        optionsButton: {
          padding: scale(8),
          borderRadius: scale(theme.borderRadius.full),
          backgroundColor: theme.colors.background,
        },
      }),
    [theme, insets.top]
  );

  return (
    <View style={styles.container}>
      {/* Left Section - Back Button and Profile */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={scale(20)}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <View style={styles.profilePicture}>
            <ProfilePicture
              profilePicture={otherUser.profilePicture}
              size={40}
            />
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {otherUser.name}
              </Text>
              {otherUser.isAdmin && (
                <Ionicons
                  name="shield-checkmark"
                  size={scale(16)}
                  color={theme.colors.primary}
                  style={styles.verifiedIcon}
                />
              )}
              {otherUser.isSupporter && (
                <Ionicons
                  name="heart"
                  size={scale(16)}
                  color={theme.colors.secondary}
                  style={styles.supporterIcon}
                />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Right Section - Options Button */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={onOptionsPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={scale(20)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
