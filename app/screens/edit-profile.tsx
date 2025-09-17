import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingModal } from "@/components/common/LoadingModal";
import { useEditProfile } from "@/hooks/useEditProfile";
import { useTranslation } from "react-i18next";
import { KeyboardHandler } from "@/components/common/KeyboardHandler";
import { Button } from "@/components/ui/Button";

export default function EditProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    scrollViewRef,
    isUpdating,
    loadingModalState,
    control,
    errors,
    currentStepData,
    isFirstStep,
    progressPercentage,
    handleNext,
    handleBack,
    handleLoadingModalComplete,
    getButtonText,
  } = useEditProfile();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    progressContainer: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
    },
    progressBar: {
      height: verticalScale(6),
      backgroundColor: theme.colors.borderLight,
      borderRadius: scale(theme.borderRadius.full),
      overflow: "hidden",
      marginBottom: verticalScale(8),
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: scale(theme.borderRadius.full),
    },
    scrollContainer: {
      flex: 1,
    },
    stepContainer: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      paddingHorizontal: 18,
      paddingVertical: 6,
      gap: 18
    }
  });

  const CurrentStepComponent = currentStepData?.component;

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScreenHeader
        title={currentStepData?.title || "Edit Profile"}
        onBack={handleBack}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
      </View>
      
      <KeyboardHandler enabled={true}>
        {/* Step Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.stepContainer}>
            {CurrentStepComponent && (
              <CurrentStepComponent control={control} errors={errors} />
            )}
          </View>
        </ScrollView>
      </KeyboardHandler>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
      {!isFirstStep && (
        <Button
          onPress={handleBack}
          text={t("common.back")}
          bgColor={theme.colors.textMuted}
          style={{flex:1}}
        />
      )}
      <Button
        onPress={handleNext}
        text={getButtonText()}
        style={{flex:1}}
      />
      </View>

      {/* Loading Modal */}
      <LoadingModal
        visible={loadingModalState !== 'hidden'}
        state={loadingModalState === 'hidden' ? 'loading' : loadingModalState}
        onComplete={handleLoadingModalComplete}
      />
    </SafeAreaView>
  );
}
