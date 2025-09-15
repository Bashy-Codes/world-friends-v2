import React from "react";
import { View, StyleSheet } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const ConversationItemSkeleton: React.FC = () => {
  const theme = useTheme();

  const shimmerColors = [
    theme.colors.surfaceSecondary,
    theme.colors.border,
    theme.colors.surfaceSecondary,
  ];

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
    content: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(14),
    },
    profileSection: {
      marginRight: scale(12),
    },
    profileImage: {
      width: scale(52),
      height: scale(52),
      borderRadius: scale(26),
    },
    contentSection: {
      flex: 1,
      justifyContent: "center",
    },
    userName: {
      width: "60%",
      height: verticalScale(16),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(8),
    },
    messagePreview: {
      width: "80%",
      height: verticalScale(14),
      borderRadius: scale(theme.borderRadius.sm),
    },
    rightSection: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: scale(52),
      paddingVertical: verticalScale(4),
    },
    timestamp: {
      width: scale(40),
      height: verticalScale(12),
      borderRadius: scale(theme.borderRadius.sm),
    },
    unreadIndicator: {
      marginBottom: verticalScale(4),
      width: scale(10),
      height: scale(10),
      borderRadius: scale(6),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.profileImage}
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.userName}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.messagePreview}
          />
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.timestamp}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.unreadIndicator}
          />
        </View>
      </View>
    </View>
  );
};
