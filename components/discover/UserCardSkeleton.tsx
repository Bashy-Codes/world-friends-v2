import type React from "react";
import { View, StyleSheet } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const UserCardSkeleton: React.FC = () => {
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
      width: scale(60),
      height: verticalScale(30),
      borderRadius: scale(theme.borderRadius.full),
      marginRight: scale(8),
    },
    ageButton: {
      width: scale(75),
      height: verticalScale(30),
      borderRadius: scale(theme.borderRadius.full),
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderRadius: scale(theme.borderRadius.md),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      marginBottom: verticalScale(10),
      width: "100%",
    },
    detailIcon: {
      width: scale(20),
      height: scale(20),
      borderRadius: scale(theme.borderRadius.sm),
      marginRight: scale(12),
    },
    detailLabel: {
      width: scale(60),
      height: verticalScale(16),
      borderRadius: scale(theme.borderRadius.sm),
      marginRight: scale(8),
    },
    detailValue: {
      flex: 1,
      height: verticalScale(16),
      borderRadius: scale(theme.borderRadius.sm),
    }
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

      <View style={styles.detailRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailIcon}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailLabel}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailValue}
        />
      </View>

      <View style={styles.detailRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailIcon}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailLabel}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailValue}
        />
      </View>

      <View style={styles.detailRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailIcon}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailLabel}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailValue}
        />
      </View>
    </View>
  );
};
