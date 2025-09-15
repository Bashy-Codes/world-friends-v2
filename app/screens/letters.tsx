import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { useLetters } from "@/hooks/communications/useLetters";

// components
import { ScreenHeader } from "@/components/ScreenHeader";
import { Greetings } from "@/components/feed/Greetings";
import { EmptyState } from "@/components/EmptyState";
import { LetterCard } from "@/components/letters/LetterCard";
import { LetterCardSkeleton } from "@/components/letters/LetterCardSkeleton";
import { LetterSegmentControl } from "@/components/letters/LetterSegmentControl";

export default function LettersScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    // State
    activeSegment,
    letters,
    loading,
    loadingMore,

    // Handlers
    handleSegmentChange,
    handleLoadMore,
    handleDeleteLetter,
    handleOpenLetter,
    handleComposeLetter,
  } = useLetters();

  const renderLetter = useCallback(
    ({ item }: { item: any }) => (
      <LetterCard
        letter={item}
        onDelete={handleDeleteLetter}
        onOpen={handleOpenLetter}
      />
    ),
    [handleDeleteLetter, handleOpenLetter]
  );

  const renderSkeleton = useCallback(() => <LetterCardSkeleton />, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loadingMore, theme.colors.primary]);

  const renderEmptyState = useCallback(() => {
    return <EmptyState style={{ flex: 1, minHeight: verticalScale(400) }} />;
  }, []);

  // List renderers and props
  const skeletonData = useMemo(() => Array(5).fill(null), []);
  const renderItem = loading ? renderSkeleton : renderLetter;
  const keyExtractor = useCallback(
    (item: any, index: number) => (loading ? `skeleton-${index}` : item.letterId),
    [loading]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContainer: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: verticalScale(20),
      paddingBottom: insets.bottom,
    },
    footerLoader: {
      paddingVertical: verticalScale(20),
      alignItems: "center",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScreenHeader title={t("screenTitles.letters")} />
      <View style={styles.listContainer}>
        <FlashList
          data={loading ? skeletonData : letters}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={120}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <Greetings onCreatePost={handleComposeLetter} />
              <LetterSegmentControl
                activeSegment={activeSegment}
                onSegmentChange={handleSegmentChange}
              />
            </>
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          contentContainerStyle={styles.contentContainer}
        />
      </View>
    </SafeAreaView>
  );
}
