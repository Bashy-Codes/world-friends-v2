import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useCreatePost } from "@/hooks/feed/useCreatePost";
import { TAGS } from "@/constants/geographics";

// components
import { ScreenHeader } from "@/components/ScreenHeader";
import { AddImageSection } from "@/components/feed/AddImageSection";
import { SelectCollection } from "@/components/feed/SelectCollection";
import { AddTags } from "@/components/feed/AddTags";
import { InfoSection } from "@/components/common/InfoSection";
import { ImagePickerSheet } from "@/components/common/ImagePickerSheet";
import { ItemPickerSheet } from "@/components/ItemPickerSheet";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { LoadingModal } from "@/components/common/LoadingModal";
import { CollectionsModal } from "@/components/feed/CollectionsModal";
import { LargeInputContainer } from "@/components/common/LargeInputContainer";


export default function CreatePostScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    // State
    content,
    images,
    selectedTags,
    showDiscardModal,
    showPostModal,
    loadingModalState,
    selectedCollectionId,

    // Refs
    imagePickerRef,
    collectionsModalRef,
    tagsPickerRef,

    // Computed values
    canPost,

    // Content handlers
    setContent,

    // Navigation handlers
    handleBack,

    // Post creation handlers
    handlePost,
    confirmPost,
    confirmDiscard,

    // Image handlers
    handleAddImage,
    handleImageSelected,
    handleRemoveImage,

    // Collection handlers
    handleAddToCollectionPress,
    handleCollectionSelect,
    handleRemoveCollection,

    // Tags handlers
    handleAddTagsPress,
    handleTagsSelectionChange,
    handleTagsConfirm,
    handleRemoveTag,

    // Modal handlers
    closeDiscardModal,
    closePostModal,
    handleLoadingModalComplete,
  } = useCreatePost();

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
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader
        title={t("screenTitles.createPost")}
        onBack={handleBack}
        rightComponent="button"
        rightButtonText={
          <Ionicons
            name={"checkmark-circle"}
            size={scale(20)}
            color={theme.colors.white}
          />
        }
        onRightPress={handlePost}
        rightButtonEnabled={canPost}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: verticalScale(20) }}
      >
        <LargeInputContainer
          value={content}
          onChangeText={setContent}
          maxLength={2000}
          placeholder={t("createPost.placeholder")}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          autoCorrect={true}
        />

        <AddImageSection
          images={images}
          onAddImage={handleAddImage}
          onRemoveImage={handleRemoveImage}
        />

        {/* Tags Selection */}
        <AddTags
          selectedTags={selectedTags}
          onPress={handleAddTagsPress}
          onRemoveTag={handleRemoveTag}
        />

        {/* Collection Selection */}
        <SelectCollection
          selectedCollectionId={selectedCollectionId}
          onAddCollection={handleAddToCollectionPress}
          onRemoveCollection={handleRemoveCollection}
        />

        {/* Info Section */}
        <InfoSection infoMessage={t("createPost.infoMessage")} />
      </ScrollView>

      <ImagePickerSheet
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
      />

      <ItemPickerSheet
        ref={tagsPickerRef}
        items={TAGS.map(tag => ({
          id: tag.id,
          name: tag.name,
          emoji: tag.emoji,
        }))}
        selectedItems={selectedTags}
        onSelectionChange={handleTagsSelectionChange}
        onConfirm={handleTagsConfirm}
        multiSelect={true}
        minSelection={1}
        maxSelection={3}
        searchPlaceholder={t("common.searchPlaceholder")}
      />

      <CollectionsModal
        ref={collectionsModalRef}
        onCollectionSelect={handleCollectionSelect}
      />

      <ConfirmationModal
        visible={showDiscardModal}
        icon="warning-outline"
        description={t("confirmation.discardPost.description")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmDiscard}
        onCancel={closeDiscardModal}
      />

      <ConfirmationModal
        visible={showPostModal}
        icon="checkmark-circle-outline"
        description={t("confirmation.createPost.description")}
        iconColor={theme.colors.info}
        confirmButtonColor={theme.colors.success}
        onConfirm={confirmPost}
        onCancel={closePostModal}
      />

      <LoadingModal
        visible={loadingModalState !== 'hidden'}
        state={loadingModalState === 'hidden' ? 'loading' : loadingModalState}
        onComplete={handleLoadingModalComplete}
      />
    </SafeAreaView>
  );
}
