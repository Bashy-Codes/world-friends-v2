import type React from "react"
import { useCallback } from "react"
import { View, StyleSheet, ActivityIndicator } from "react-native"
import { verticalScale } from "react-native-size-matters"
import { FlashList } from "@shopify/flash-list"
import { useTheme } from "@/lib/Theme"
import { RequestCard } from "./RequestCard"
import { EmptyState } from "@/components/EmptyState"
import type { Request } from "@/types/friendships"
import type { Id } from "@/convex/_generated/dataModel"

interface RequestsSectionProps {
  requestsData: Request[]
  requestsLoading: boolean
  requestsLoadingMore: boolean
  onAcceptRequest: (requestId: Id<"friendRequests">) => void
  onDeclineRequest: (requestId: Id<"friendRequests">) => void
  onLoadMore: () => void
}

export const RequestsSection: React.FC<RequestsSectionProps> = ({
  requestsData,
  requestsLoading,
  requestsLoadingMore,
  onAcceptRequest,
  onDeclineRequest,
  onLoadMore,
}) => {
  const theme = useTheme()

  const renderRequestItem = useCallback(
    ({ item }: { item: Request }) => (
      <RequestCard request={item} onAccept={onAcceptRequest} onDecline={onDeclineRequest} />
    ),
    [onAcceptRequest, onDeclineRequest],
  )

  const renderRequestFooter = useCallback(() => {
    if (!requestsLoadingMore) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    )
  }, [requestsLoadingMore, theme.colors.primary])

  const renderEmptyRequests = useCallback(() => {
    if (requestsLoading) return null
    return <EmptyState style={{ flex: 1, minHeight: verticalScale(400) }} />
  }, [requestsLoading])

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: verticalScale(150),
    },
    loadingFooter: {
      paddingVertical: verticalScale(20),
      alignItems: "center",
    },
    contentContainer: {
      paddingTop: verticalScale(150),
      paddingBottom: verticalScale(100),
    },
  })

  if (requestsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <FlashList
      data={requestsData}
      renderItem={renderRequestItem}
      estimatedItemSize={verticalScale(140)}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={renderRequestFooter}
      ListEmptyComponent={renderEmptyRequests}
      contentContainerStyle={styles.contentContainer}
    />
  )
}
