import React, { forwardRef, useImperativeHandle, useState, useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery, useConvexAuth } from "convex/react";
import { FlashList } from "@shopify/flash-list";
import { EmptyState } from "@/components/EmptyState";
import type { CollectionTypes } from "@/types/feed";
import { Button } from "../ui/Button";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CollectionsModalProps {
  onCollectionSelect: (collectionId: Id<"collections">) => void;
}

export interface CollectionsModalRef {
  present: () => void;
  dismiss: () => void;
}

const CollectionItem: React.FC<{
  collection: CollectionTypes;
  onPress: () => void;
  t: (key: string) => string;
}> = ({ collection, onPress, t }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(24),
      paddingVertical: verticalScale(24),
      backgroundColor: theme.colors.surface,
      marginHorizontal: scale(16),
      marginVertical: verticalScale(4),
      borderRadius: scale(theme.borderRadius.lg),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    iconContainer: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: scale(16),
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      fontSize: moderateScale(18),
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: verticalScale(4),
    }
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="images"
          size={scale(28)}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {collection.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const CollectionsModal = forwardRef<CollectionsModalRef, CollectionsModalProps>(
  ({ onCollectionSelect }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { isAuthenticated } = useConvexAuth();

    // State
    const [visible, setVisible] = useState(false);

    // Get current user's collections with pagination
    const {
      results: collections,
      status,
      loadMore,
    } = usePaginatedQuery(
      api.feed.collections.getCurrentUserCollections,
      visible && isAuthenticated ? {} : "skip",
      { initialNumItems: 10 }
    );

    const areCollectionsLoading = status === "LoadingFirstPage";

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
      },
      dismiss: () => {
        setVisible(false);
      },
    }), []);

    // Load more collections
    const handleLoadMore = useCallback(() => {
      if (status === "CanLoadMore") {
        loadMore(10);
      }
    }, [status, loadMore]);

    // Handle collection selection and dismiss the Modal
    const handleCollectionPress = useCallback((collectionId: Id<"collections">) => {
      onCollectionSelect(collectionId);
      setVisible(false);
    }, [onCollectionSelect]);

    // Handle close
    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    const renderCollectionItem = useCallback(
      ({ item }: { item: CollectionTypes }) => (
        <CollectionItem
          collection={item}
          onPress={() => handleCollectionPress(item.collectionId)}
          t={t}
        />
      ),
      [handleCollectionPress, t]
    );

    const renderLoader = () => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

    const renderEmptyState = () => (
      <EmptyState style={{ flex: 1, minHeight: verticalScale(300) }} />
    );

    const styles = StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      container: {
        backgroundColor: theme.colors.background,
        width: screenWidth * 0.9,
        height: screenHeight * 0.8,
        maxWidth: scale(500),
        maxHeight: scale(700),
        borderRadius: scale(theme.borderRadius.xl),
        shadowColor: theme.colors.shadow,
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
        overflow: 'hidden',
      },
      content: {
        flex: 1,
        paddingTop: verticalScale(8),
      },
      actionsContainer: {
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(16),
        backgroundColor: theme.colors.surface,
        borderRadius: scale(theme.borderRadius.xl),
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
    });

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Content */}
            <View style={styles.content}>
              {areCollectionsLoading ?
                renderLoader() :
                <FlashList
                  data={collections}
                  keyExtractor={(item) => item.collectionId}
                  renderItem={renderCollectionItem}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={renderEmptyState}
                  contentContainerStyle={{
                    paddingVertical: verticalScale(8),
                  }}
                />}
            </View>

            {/* Close Button */}
            <View style={styles.actionsContainer}>
              <Button
                iconName="close"
                onPress={handleClose}
                bgColor={theme.colors.error}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

CollectionsModal.displayName = "CollectionsModal";
