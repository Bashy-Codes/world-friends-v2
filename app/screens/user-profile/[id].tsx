import { useState, useCallback } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams } from "expo-router"
import { scale, verticalScale } from "react-native-size-matters"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/Theme"
import type { Id } from "@/convex/_generated/dataModel"
import { useUserDetails } from "@/hooks/useUserProfile"

// components
import { ScreenHeader } from "@/components/ScreenHeader"
import { ScreenLoading } from "@/components/ScreenLoading"
import { UserInfo } from "@/components/profile/UserInfo"
import { SegmentControl } from "@/components/profile/SegmentControl"
import { ProfileSection } from "@/components/profile/ProfileSection"
import { PostsSection } from "@/components/profile/PostsSection"
import { CollectionsSection } from "@/components/profile/CollectionsSection"
import { ActionSheet } from "@/components/common/ActionSheet"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"
import { LoadingModal } from "@/components/common/LoadingModal"
import { InputModal } from "@/components/common/InputModal"
import { ScreenPlaceholder } from "@/components/common/ScreenPlaceholder"
import { Separator } from "@/components/common/Separator"
import { Button } from "@/components/ui/Button"

type TabType = "profile" | "posts" | "collections"

export default function UserProfileScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()

  // Convert string ID to user ID type
  const userId = id as Id<"users">

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("profile")

  const {
    // State
    userProfile,
    loading,
    showBlockConfirmation,
    isBlocking,
    showRemoveFriendConfirmation,
    profileLoadingModalState,
    blockLoadingModalState,
    showRequestModal,
    isProcessingRequest,

    // Refs
    actionSheetRef,

    // Actions
    handleEllipsisPress,
    handleConfirmBlock,
    handleCancelBlock,
    handleFriendAction,
    handleSendFriendRequest,
    handleConfirmRemoveFriend,
    handleCancelRemoveFriend,
    handleCancelRequest,
    handleProfileLoadingModalComplete,
    handleBlockLoadingModalComplete,

    // Options
    actionSheetOptions,
  } = useUserDetails(userId)

  // Tab handlers
  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingBottom: verticalScale(20),
    },
    actionsContainer: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
    },
    contentContainer: {
      flex: 1,
    },
  })

  if (loading || isBlocking) {
    return <ScreenLoading />
  }

  if (!userProfile) {
    return (
     <ScreenPlaceholder
        title={t("emptyState.userNotFound")}
        icon="person-circle-outline"
        showButton={false}
      />
    )
  }

  // If user is admin, show admin view
  if (userProfile.isAdmin) {
    return (
      <ScreenPlaceholder
        title="WorldFriends Team"
        icon="shield-checkmark"
        showButton={false}
      />
    )
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader title={`${userProfile.name}`} rightComponent="ellipsis" onRightPress={handleEllipsisPress} />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={true}>
        <UserInfo
          profilePicture={userProfile.profilePicture}
          name={userProfile.name}
          username={userProfile.username}
          gender={userProfile.gender}
          age={userProfile.age}
          countryCode={userProfile.country}
          isAdmin={userProfile.isAdmin}
          isSupporter={userProfile.isSupporter}
        />

        {/* Only show action button if user is not a friend */}
        {!userProfile.isFriend && (
          <View style={styles.actionsContainer}>
            {userProfile.hasPendingRequest ? (
              <Button
                iconName="time"
                text={t("profile.pendingRequest")}
                disabled
                onPress={() => { }}
              />
            ) : (
              <Button
                iconName="person-add"
                text={t("profile.addFriend")}
                onPress={handleFriendAction}
                disabled={isProcessingRequest}
              />
            )}
          </View>
        )}

        <Separator customOptions={["⋆｡✿ ⋆ ── ⋆ ✿｡⋆"]} />
        {/* Segmented Control */}
        <SegmentControl activeTab={activeTab} onTabPress={handleTabPress} />

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === "profile" ? (
            <ProfileSection
              aboutMe={userProfile.aboutMe}
              spokenLanguageCodes={userProfile.spokenLanguages}
              learningLanguageCodes={userProfile.learningLanguages}
              hobbies={userProfile.hobbies}
            />
          ) : activeTab === "posts" ? (
            <PostsSection userId={userProfile.userId} isFriend={userProfile.isFriend} />
          ) : (
            <CollectionsSection userId={userProfile.userId} isFriend={userProfile.isFriend} showCreateButton={false} />
          )}
        </View>
      </ScrollView>

      <ActionSheet ref={actionSheetRef} options={actionSheetOptions} />

      <ConfirmationModal
        visible={showBlockConfirmation}
        icon="ban"
        description={t("confirmation.blockUser.description")}
        onConfirm={handleConfirmBlock}
        onCancel={handleCancelBlock}
      />
      <ConfirmationModal
        visible={showRemoveFriendConfirmation}
        icon="person-remove"
        description={t("confirmation.removeFriend.description")}
        onConfirm={handleConfirmRemoveFriend}
        onCancel={handleCancelRemoveFriend}
      />
      <InputModal
        visible={showRequestModal}
        title={t("profile.friendRequestModal.title")}
        inputPlaceholder={t("profile.friendRequestModal.placeholder") + userProfile.name}
        maxCharacters={400}
        onSubmit={handleSendFriendRequest}
        onCancel={handleCancelRequest}
        submitIcon="send"
      />
      <LoadingModal
        visible={profileLoadingModalState !== "hidden"}
        state={profileLoadingModalState === "hidden" ? "loading" : profileLoadingModalState}
        onComplete={handleProfileLoadingModalComplete}
      />
      <LoadingModal
        visible={blockLoadingModalState !== "hidden"}
        state={blockLoadingModalState === "hidden" ? "loading" : blockLoadingModalState}
        onComplete={handleBlockLoadingModalComplete}
      />
    </SafeAreaView>
  )
}
