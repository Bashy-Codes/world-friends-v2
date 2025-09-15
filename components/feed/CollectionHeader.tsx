import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";

interface CollectionDetails {
  collectionId: Id<"collections">;
  title: string;
  postsCount: number;
}

interface CollectionHeaderProps {
  collectionDetails: CollectionDetails;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  collectionDetails,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: scale(16),
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
      borderRadius: scale(theme.borderRadius.xl),
      overflow: "hidden",
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    headerSection: {
      backgroundColor: `${theme.colors.primary}08`,
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(24),
      paddingBottom: verticalScale(20),
      alignItems: "center",
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: moderateScale(34),
      letterSpacing: 0.5,
    },
    contentSection: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: scale(24),
      paddingVertical: verticalScale(20),
    },
    statsContainer: {
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: scale(theme.borderRadius.lg),
      paddingVertical: verticalScale(16),
      paddingHorizontal: scale(20),
      alignItems: "center",
    },
    statsItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statsIcon: {
      marginRight: scale(8),
    },
    statsNumber: {
      color: theme.colors.primary,
      fontWeight: "800",
      fontSize: moderateScale(18),
    },
  });

  return (
    <View style={styles.container}>
      {/* Header Section with Title */}
      <View style={styles.headerSection}>
        <Text style={styles.title} numberOfLines={2}>
          {collectionDetails.title}
        </Text>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Posts Count */}
        <View style={styles.statsContainer}>
          <View style={styles.statsItem}>
            <Ionicons
              name="images"
              size={scale(22)}
              color={theme.colors.primary}
              style={styles.statsIcon}
            />
            <Text style={styles.statsNumber}>
              {collectionDetails.postsCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
