import { View, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/Theme"
import { useFriends } from "@/hooks/useFriends"

// components
import { TabHeader } from "@/components/TabHeader"
import { SegmentedControl } from "@/components/friends/SegmentedControl"
import { FriendsSection } from "@/components/friends/FriendsSection"
import { RequestsSection } from "@/components/friends/RequestsSection"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"
import { LoadingModal } from "@/components/common/LoadingModal"

export default function FriendsTab() {
  const theme = useTheme()
  const { t } = useTranslation()

  const {
    // State
    selectedSegment,
    friendsData,
    requestsData,
    friendsLoading,
    requestsLoading,
    friendsLoadingMore,
    requestsLoadingMore,
    showRemoveConfirmation,
    loadingModalState,

    // Event handlers
    handleSegmentPress,
    handleMessage,
    handleAcceptRequest,
    handleDeclineRequest,
    handleViewProfile,
    handleConfirmRemoveFriend,
    handleCancelRemoveFriend,
    handleLoadingModalComplete,
    loadMoreFriends,
    loadMoreRequests,
  } = useFriends()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.content}>
        {selectedSegment === "friends" ? (
          <FriendsSection
            friendsData={friendsData}
            friendsLoading={friendsLoading}
            friendsLoadingMore={friendsLoadingMore}
            onMessage={handleMessage}
            onViewProfile={handleViewProfile}
            onLoadMore={loadMoreFriends}
          />
        ) : (
          <RequestsSection
            requestsData={requestsData}
            requestsLoading={requestsLoading}
            requestsLoadingMore={requestsLoadingMore}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onLoadMore={loadMoreRequests}
          />
        )}
      </View>

      <TabHeader title={t("screenTitles.friends.title")} />

      <SegmentedControl
        segments={[t("screenTitles.friends.title"), t("screenTitles.friends.secondSection")]}
        selectedIndex={selectedSegment === "friends" ? 0 : 1}
        onSegmentPress={handleSegmentPress}
      />

      <ConfirmationModal
        visible={showRemoveConfirmation}
        icon="person-remove"
        description={t("confirmation.removeFriend.description")}
        onConfirm={handleConfirmRemoveFriend}
        onCancel={handleCancelRemoveFriend}
      />

      <LoadingModal
        visible={loadingModalState !== "hidden"}
        state={loadingModalState === "hidden" ? "loading" : loadingModalState}
        onComplete={handleLoadingModalComplete}
      />
    </SafeAreaView>
  )
}
