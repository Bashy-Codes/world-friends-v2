import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useTranslation } from "react-i18next";
import { useComposeLetter } from "@/hooks/communications/useComposeLetter";
import { getCountryByCode } from "@/constants/geographics";

// components
import { ScreenHeader } from "@/components/ScreenHeader";
import { ProfilePicture } from "@/components/common/TinyProfilePicture";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { LoadingModal } from "@/components/common/LoadingModal";
import { FriendsPickerSheet } from "@/components/letters/FriendsPickerSheet";
import { ScheduleLetter } from "@/components/letters/ScheduleLetter";
import { LargeInputContainer } from "@/components/common/LargeInputContainer";
import { Button } from "@/components/ui/Button";

export default function ComposeLetterScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    // State
    title,
    content,
    selectedFriend,
    scheduleDays,
    showDiscardModal,
    showSendModal,
    loadingModalState,

    // Refs
    friendsPickerRef,

    // Computed values
    canSend,

    // Constants
    MAX_CONTENT_LENGTH,
    MIN_CONTENT_LENGTH,

    // Handlers
    handleTitleChange,
    handleContentChange,
    handleSelectFriend,
    handleFriendSelected,
    handleRemoveFriend,
    handleScheduleIncrease,
    handleScheduleDecrease,
    handleBack,
    handleSend,
    confirmSend,
    confirmDiscard,
    closeSendModal,
    closeDiscardModal,
    handleLoadingModalComplete,

    // Utility functions
    getScheduleText,
  } = useComposeLetter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(16),
    },
    titleInputContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(16),
      marginBottom: verticalScale(12),
    },
    titleInput: {
      fontSize: moderateScale(18),
      fontWeight: "600",
      color: theme.colors.text,
      textAlignVertical: "top",
    },
    friendSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(16),
      marginVertical: verticalScale(16),
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    sectionIcon: {
      marginRight: scale(8),
    },
    sectionTitle: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    friendSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: verticalScale(8),
    },
    friendInfo: {
      flexDirection: "row",
      padding: scale(12),
      alignItems: "center",
      flex: 1,
      gap: scale(14),
    },
    friendName: {
      marginBottom: verticalScale(16),
      fontSize: moderateScale(16),
      fontWeight: "500",
      color: theme.colors.text,
    },
    selectButtonContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    removeButton: {
      marginRight: scale(18),
      padding: scale(8),
      borderRadius: scale(theme.borderRadius.full),
      backgroundColor: theme.colors.error,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader
        title={t("screenTitles.composeLetter")}
        onBack={handleBack}
        rightComponent="button"
        rightButtonText={
          <Ionicons
            name="send"
            size={scale(20)}
            color={theme.colors.white}
          />
        }
        onRightPress={handleSend}
        rightButtonEnabled={canSend}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: verticalScale(20) }}
      >
        {/* Title Input */}
        <View style={styles.titleInputContainer}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={handleTitleChange}
            placeholder={t("composeLetter.letterTitleInput")}
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.primary}
            maxLength={100}
          />
        </View>

        {/* Content Input */}
        <LargeInputContainer
          value={content}
          onChangeText={handleContentChange}
          minLength={MIN_CONTENT_LENGTH}
          maxLength={MAX_CONTENT_LENGTH}
          placeholder={t("composeLetter.inputPlaceholder")}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          autoCorrect={true}
        />

        {/* Friend Selection */}
        <View style={styles.friendSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="truck-fast"
              size={scale(26)}
              color={theme.colors.primary}
              style={styles.sectionIcon}
              />
            <Text style={styles.sectionTitle}>{t("composeLetter.deliverTo")}</Text>
          </View>

          <View style={styles.friendSelector}>
            {selectedFriend ? (
              <>
                <View style={styles.friendInfo}>
                  <ProfilePicture
                    profilePicture={selectedFriend.profilePicture}
                    size={46}
                  />
                  <Text style={styles.friendName}>{selectedFriend.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveFriend}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={scale(16)}
                    color={theme.colors.white}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.selectButtonContainer}>
                <Button
                  iconName="add"
                  onPress={handleSelectFriend}
                />
              </View>
            )}
          </View>
        </View>

        {/* Schedule Section */}
        <ScheduleLetter
          scheduleDays={scheduleDays}
          onIncrease={handleScheduleIncrease}
          onDecrease={handleScheduleDecrease}
          minDays={1}
          maxDays={30}
          getScheduleText={getScheduleText}
        />
      </ScrollView>

      {/* Friends Picker Sheet */}
      <FriendsPickerSheet
        ref={friendsPickerRef}
        onFriendSelected={handleFriendSelected}
      />

      {/* Discard Confirmation Modal */}
      <ConfirmationModal
        visible={showDiscardModal}
        icon="warning-outline"
        description={t("confirmation.discardLetter.description")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmDiscard}
        onCancel={closeDiscardModal}
      />

      {/* Send Confirmation Modal */}
      <ConfirmationModal
        visible={showSendModal}
        icon="send-outline"
        description={selectedFriend ? t("confirmation.sendLetter.description", {
          name: selectedFriend.name,
          countryFlag: getCountryByCode(selectedFriend.country)?.flag || "🌍",
          days: scheduleDays
        }) : ""}
        iconColor={theme.colors.primary}
        confirmButtonColor={theme.colors.success}
        onConfirm={confirmSend}
        onCancel={closeSendModal}
      />

      {/* Loading Modal */}
      <LoadingModal
        visible={loadingModalState !== 'hidden'}
        state={loadingModalState === 'hidden' ? 'loading' : loadingModalState}
        onComplete={handleLoadingModalComplete}
      />
    </SafeAreaView>
  );
}
