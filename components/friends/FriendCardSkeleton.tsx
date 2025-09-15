import type React from "react";
import { View, StyleSheet } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const FriendCardSkeleton: React.FC = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(20),
      marginHorizontal: scale(16),
      marginVertical: verticalScale(8),
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    profileImage: {
      width: scale(100),
      height: scale(100),
      borderRadius: scale(theme.borderRadius.full),
      marginBottom: verticalScale(16),
    },
    name: {
      width: "70%",
      height: verticalScale(24),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(12),
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: verticalScale(12),
      width: "100%",
    },
    genderButton: {
      width: scale(50),
      height: verticalScale(30),
      borderRadius: scale(theme.borderRadius.full),
      marginRight: scale(8),
    },
    ageButton: {
      width: scale(60),
      height: verticalScale(30),
      borderRadius: scale(theme.borderRadius.full),
    },
    countryContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(20),
    },
    countryText: {
      width: scale(120),
      height: verticalScale(18),
      borderRadius: scale(theme.borderRadius.sm),
    },
    messageButton: {
      width: "100%",
      height: verticalScale(48),
      borderRadius: scale(theme.borderRadius.full),
    },
  });

  const shimmerColors = [
    theme.colors.surfaceSecondary,
    theme.colors.border,
    theme.colors.surfaceSecondary,
  ];

  return (
    <View style={styles.card}>
      <ShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={styles.profileImage}
      />
      <ShimmerPlaceholder shimmerColors={shimmerColors} style={styles.name} />

      <View style={styles.infoRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.genderButton}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.ageButton}
        />
      </View>

      <View style={styles.countryContainer}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.countryText}
        />
      </View>

      <ShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={styles.messageButton}
      />
    </View>
  );
};
