import React, { forwardRef, useState, useCallback, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Dimensions, Pressable, ActivityIndicator } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { usePaginatedQuery } from "convex/react";
import { useTheme } from "@/lib/Theme";
import { ProfilePicture } from "@/components/common/TinyProfilePicture";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EmptyState } from "@/components/EmptyState";
import { getCountryByCode } from "@/constants/geographics";

const { height: screenHeight } = Dimensions.get('window');

export interface Friend {
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  gender: "male" | "female" | "other";
  age: number;
  country: string;
}


interface FriendsPickerSheetProps {
  onFriendSelected: (friend: Friend) => void;
}

export interface FriendsPickerSheetRef {
  present: () => void;
  dismiss: () => void;
}

// Friend Item Component
const FriendItemComponent: React.FC<{
  friend: Friend;
  onPress: () => void;
  theme: any;
}> = ({ friend, onPress, theme }) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: verticalScale(24),
      paddingHorizontal: scale(16),
      borderRadius: scale(12),
      marginVertical: verticalScale(2),
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    textContainer: {
      flex: 1,
      marginLeft: scale(12),
    },
    name: {
      fontSize: moderateScale(20),
      color: theme.colors.text,
      fontWeight: "500",
    },
    details: {
      fontSize: moderateScale(16),
      color: theme.colors.textSecondary,
      marginTop: verticalScale(2),
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <ProfilePicture
          profilePicture={friend.profilePicture}
          size={46}
          lazy={true}
          priority="low"
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{}{friend.name}</Text>
          <Text style={styles.details}>
          {friend.gender === "female" ? "👩" : friend.gender === "male" ? "👨" : "👤"} • {getCountryByCode(friend.country)?.flag}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const FriendsPickerSheet = forwardRef<FriendsPickerSheetRef, FriendsPickerSheetProps>(
  ({ onFriendSelected }, ref) => {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);

    // Fetch friends data
    const {
      results: friendsData,
      status: friendsStatus,
      loadMore: loadMoreFriends,
    } = usePaginatedQuery(
      api.friendships.getUserFriends,
      visible ? {} : "skip", // Only fetch when visible
      { initialNumItems: 20 }
    );

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
      },
      dismiss: () => {
        setVisible(false);
      },
    }), []);

    const handleFriendPress = useCallback((friend: Friend) => {
      onFriendSelected(friend);
      setVisible(false);
    }, [onFriendSelected]);

    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    const handleLoadMore = useCallback(() => {
      if (friendsStatus === "CanLoadMore") {
        loadMoreFriends(20);
      }
    }, [friendsStatus, loadMoreFriends]);

    const styles = StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      },
      container: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: scale(theme.borderRadius.xl),
        borderTopRightRadius: scale(theme.borderRadius.xl),
        height: screenHeight * 0.8,
        paddingTop: verticalScale(8),
      },
      headerLine: {
        width: scale(40),
        height: verticalScale(4),
        backgroundColor: theme.colors.textMuted,
        borderRadius: scale(theme.borderRadius.full),
        alignSelf: 'center',
        marginBottom: verticalScale(16),
      },
      header: {
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      listContainer: {
        flex: 1,
        paddingHorizontal: scale(10),
      },
      loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
    });

    const renderItem = useCallback(
      ({ item }: { item: Friend }) => {
        return (
          <FriendItemComponent
            friend={item}
            onPress={() => handleFriendPress(item)}
            theme={theme}
          />
        );
      },
      [handleFriendPress, theme]
    );

    const renderEmpty = useCallback(
      () => (
        <EmptyState style={{ flex: 1, minHeight: verticalScale(300) }} />
      ),
      []
    );

    const renderLoading = useCallback(
      () => (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ),
      [styles]
    );

    const keyExtractor = useCallback((item: Friend) => item.userId, []);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
            {/* Drag indicator */}
            <View style={styles.headerLine} />

            {/* Friends list */}
            <View style={styles.listContainer}>
              {friendsStatus === "LoadingFirstPage" ? (
                renderLoading()
              ) : (
                <FlatList
                  data={friendsData || []}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={renderEmpty}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  contentContainerStyle={{
                    paddingBottom: verticalScale(20),
                    paddingTop: verticalScale(18),
                  }}
                />
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

FriendsPickerSheet.displayName = "FriendsPickerSheet";
