import type React from "react"
import { useCallback, useMemo } from "react"
import { View, StyleSheet, ActivityIndicator } from "react-native"
import { verticalScale } from "react-native-size-matters"
import { FlashList } from "@shopify/flash-list"
import { useTheme } from "@/lib/Theme"
import { FriendCard } from "./FriendCard"
import { FriendCardSkeleton } from "./FriendCardSkeleton"
import { EmptyState } from "@/components/EmptyState"
import type { Friend } from "@/types/friendships"
import type { Id } from "@/convex/_generated/dataModel"

interface FriendsSectionProps {
  friendsData: Friend[]
  friendsLoading: boolean
  friendsLoadingMore: boolean
  onMessage: (friendId: Id<"users">) => void
  onViewProfile: (userId: Id<"users">) => void
  onLoadMore: () => void
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({
  friendsData,
  friendsLoading,
  friendsLoadingMore,
  onMessage,
  onViewProfile,
  onLoadMore,
}) => {
  const theme = useTheme()

  const friendSkeletons = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ id: `skeleton-${i}` })), [])

  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => <FriendCard friend={item} onMessage={onMessage} onViewProfile={onViewProfile} />,
    [onMessage, onViewProfile],
  )

  const renderFriendSkeleton = useCallback(() => <FriendCardSkeleton />, [])

  const renderFriendFooter = useCallback(() => {
    if (!friendsLoadingMore) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    )
  }, [friendsLoadingMore, theme.colors.primary])

  const renderEmptyFriends = useCallback(() => {
    if (friendsLoading) return null
    return <EmptyState style={{ flex: 1, minHeight: verticalScale(400) }} />
  }, [friendsLoading])

  const styles = StyleSheet.create({
    loadingFooter: {
      paddingVertical: verticalScale(20),
      alignItems: "center",
    },
    contentContainer: {
      paddingTop: verticalScale(150),
      paddingBottom: verticalScale(100),
    },
  })

  if (friendsLoading) {
    return (
      <FlashList
        data={friendSkeletons}
        renderItem={renderFriendSkeleton}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    )
  }

  return (
    <FlashList
      data={friendsData}
      renderItem={renderFriendItem}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={renderFriendFooter}
      ListEmptyComponent={renderEmptyFriends}
      contentContainerStyle={styles.contentContainer}
    />
  )
}
