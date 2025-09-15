import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import type { CollectionCardProps } from "@/types/feed";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/common/Separator";

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onViewPress,
  onDeletePress,
  showDeleteButton = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleViewPress = useCallback(() => {
    onViewPress(collection.collectionId);
  }, [collection.collectionId, onViewPress]);

  const handleDeletePress = useCallback(() => {
    onDeletePress?.(collection.collectionId);
  }, [collection.collectionId, onDeletePress]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(20),
      marginHorizontal: scale(16),
      marginBottom: verticalScale(16),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      overflow: "hidden",
    },
    imageContainer: {
      height: verticalScale(120),
      backgroundColor: `${theme.colors.info}10`,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    collectionImage: {
      width: scale(100),
      height: scale(100),
      borderRadius: scale(16),
    },
    contentContainer: {
      padding: scale(20),
      paddingTop: scale(16),
    },
    title: {
      fontSize: moderateScale(18),
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: verticalScale(4),
      textAlign: "center",
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    viewButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(20),
      borderRadius: scale(25),
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    viewButtonText: {
      fontSize: moderateScale(14),
      fontWeight: "700",
      color: theme.colors.white,
      letterSpacing: 0.5,
    },
    deleteButton: {
      width: scale(44),
      height: scale(44),
      backgroundColor: `${theme.colors.error}12`,
      borderRadius: scale(22),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${theme.colors.error}20`,
    },
  });

  return (
    <View style={styles.container}>
      {/* Image Header */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/collections.png")}
          style={styles.collectionImage}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {collection.title}
        </Text>
         <Separator customOptions={["⚬⭑⚬ ─── ⚬⭑⚬"]} />
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={handleViewPress}
            activeOpacity={0.8}
          >
            <Text style={styles.viewButtonText}>
              {t("common.view")}
            </Text>
          </TouchableOpacity>

          {showDeleteButton && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-outline"
                size={scale(20)}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
