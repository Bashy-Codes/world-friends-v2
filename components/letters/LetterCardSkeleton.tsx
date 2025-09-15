import type React from "react";
import { View, StyleSheet } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const LetterCardSkeleton: React.FC = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(16),
      marginHorizontal: scale(16),
      marginVertical: verticalScale(6),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    profileImage: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(theme.borderRadius.full),
    },
    userInfo: {
      flex: 1,
      marginLeft: scale(12),
    },
    flag: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(theme.borderRadius.md),
    },
    userName: {
      width: "60%",
      height: verticalScale(16),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(4),
    },
    userDetails: {
      width: "40%",
      height: verticalScale(12),
      borderRadius: scale(theme.borderRadius.sm),
    },
    title: {
      width: "85%",
      height: verticalScale(14),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(6),
    },
    titleSecondLine: {
      width: "65%",
      height: verticalScale(14),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(12),
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statusText: {
      width: scale(36),
      height: verticalScale(32),
      borderRadius: scale(theme.borderRadius.sm),
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(theme.borderRadius.full),
      marginLeft: scale(8),
    },
  });

  const shimmerColors = [
    theme.colors.surfaceSecondary,
    theme.colors.border,
    theme.colors.surfaceSecondary,
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.userName}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.userDetails}
          />
        </View>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.flag}
        />
      </View>

      <ShimmerPlaceholder shimmerColors={shimmerColors} style={styles.title} />
      <ShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={styles.titleSecondLine}
      />

      <View style={styles.footer}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.statusText}
        />
        <View style={styles.actions}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
};
