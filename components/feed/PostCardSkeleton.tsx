import type React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const PostCardSkeleton: React.FC = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      width: SCREEN_WIDTH,
      marginBottom: verticalScale(1),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
    },
    userSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    profilePicture: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(theme.borderRadius.full),
      marginRight: scale(12),
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      width: "60%",
      height: verticalScale(16),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(6),
    },
    timeText: {
      width: "40%",
      height: verticalScale(12),
      borderRadius: scale(theme.borderRadius.sm),
    },
    moreButton: {
      width: scale(20),
      height: scale(20),
      borderRadius: scale(theme.borderRadius.sm),
    },
    content: {
      paddingHorizontal: scale(16),
      marginBottom: verticalScale(12),
    },
    contentLine1: {
      width: "95%",
      height: verticalScale(15),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(6),
    },
    contentLine2: {
      width: "85%",
      height: verticalScale(15),
      borderRadius: scale(theme.borderRadius.sm),
      marginBottom: verticalScale(6),
    },
    contentLine3: {
      width: "70%",
      height: verticalScale(15),
      borderRadius: scale(theme.borderRadius.sm),
    },
    imagesContainer: {
      marginBottom: verticalScale(12),
      alignItems: "center",
      height: verticalScale(300),
    },
    postImage: {
      width: "100%",
      height: "100%",
      borderRadius: 0,
    },
    metaContainer: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
    },
    tagsContainer: {
      flexDirection: "row",
      marginBottom: verticalScale(12),
    },
    tag1: {
      width: scale(60),
      height: verticalScale(24),
      borderRadius: scale(theme.borderRadius.full),
      marginRight: scale(8),
    },
    tag2: {
      width: scale(80),
      height: verticalScale(24),
      borderRadius: scale(theme.borderRadius.full),
      marginRight: scale(8),
    },
    tag3: {
      width: scale(50),
      height: verticalScale(24),
      borderRadius: scale(theme.borderRadius.full),
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    reactionButton: {
      width: scale(70),
      height: verticalScale(32),
      borderRadius: scale(theme.borderRadius.full),
      marginRight: scale(16),
    },
    commentButton: {
      width: scale(60),
      height: verticalScale(32),
      borderRadius: scale(theme.borderRadius.full),
    },
    reactionsCount: {
      width: scale(40),
      height: verticalScale(20),
      borderRadius: scale(theme.borderRadius.sm),
    },
  });

  const shimmerColors = [
    theme.colors.surfaceSecondary,
    theme.colors.border,
    theme.colors.surfaceSecondary,
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.profilePicture}
          />
          <View style={styles.userInfo}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.userName}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.timeText}
            />
          </View>
        </View>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.moreButton}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.contentLine1}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.contentLine2}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.contentLine3}
        />
      </View>

      {/* Image Placeholder */}
      <View style={styles.imagesContainer}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.postImage}
        />
      </View>

      {/* Meta Section - Tags and Actions */}
      <View style={styles.metaContainer}>
        {/* Tags */}
        <View style={styles.tagsContainer}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.tag1}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.tag2}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.tag3}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <View style={styles.leftActions}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.reactionButton}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.commentButton}
            />
          </View>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.reactionsCount}
          />
        </View>
      </View>
    </View>
  );
};