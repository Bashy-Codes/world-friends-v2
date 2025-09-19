import React, { useCallback, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { router } from "expo-router";
import { useTheme, useThemeActions } from "@/lib/Theme";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import {
  getCurrentLanguage,
  SupportedLanguageCode,
} from "@/lib/i18n";
import { logOutRevenueCat } from "@/lib/RevenueCat";

// components
import { ScreenHeader } from "@/components/ScreenHeader";
import { ActionItem } from "@/components/common/ActionItem";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { LoadingModal } from "@/components/common/LoadingModal";
import { LanguagePicker, LanguagePickerRef } from "@/components/LanguagePicker";

export default function SettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { signOut } = useAuthActions();
  const convex = useConvex();
  const { toggleTheme } = useThemeActions();
  const deleteProfile = useMutation(api.users.deleteProfile);
  const languagePickerRef = useRef<LanguagePickerRef>(null);

  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingModalState, setLoadingModalState] = useState<'hidden' | 'loading' | 'success' | 'error'>('hidden');
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguageCode>(getCurrentLanguage());

  // Theme handlers
  const handleThemeToggle = useCallback(
    (_value: boolean) => {
      toggleTheme();
    },
    [toggleTheme]
  );

  const handleEditProfile = useCallback(() => {
    router.push("/screens/edit-profile");
  }, []);

  const handleSupportPress = useCallback(() => {
    router.push("/screens/support");
  }, []);

  const handleContactPress = () => {
    Linking.openURL("mailto:hello@worldfriends.app");
  };

  const handleLanguagePicker = useCallback(() => {
    languagePickerRef.current?.present();
  }, []);

  const handleLanguageChange = useCallback(
    (languageCode: SupportedLanguageCode) => {
      setCurrentLanguage(languageCode);
      Toast.show({
        type: "success",
        text1: t("successToasts.languageChanged.text1"),
        text2: t("successToasts.languageChanged.text2"),
        position: "top",
      });
    },
    [t]
  );

  const handleLogout = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    try {
      await signOut();
      convex.clearAuth();
      await logOutRevenueCat();
      setShowLogoutModal(false);
      router.replace("/(auth)/auth");
    } catch (error) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2: t("errorToasts.genericError.text2"),
        position: "top",
      });
    }
  }, [signOut, router, t, convex]);

  const handleDeleteAccount = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleLoadingModalComplete = useCallback(() => {
    setLoadingModalState('hidden');
  }, []);

  const confirmDeleteAccount = useCallback(async () => {
    try {
      setShowDeleteModal(false);
      setLoadingModalState('loading');

      await deleteProfile();

      setLoadingModalState('success');

      setTimeout(() => {
        router.replace("/(auth)");
      }, 2000); 

    } catch (error) {
      console.error("Delete account error:", error);

      // Show error state
      setLoadingModalState('error');

      setTimeout(() => {
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError.text1"),
          text2: t("errorToasts.genericError.text2"),
          position: "top",
        });
      }, 3000);
    }
  }, [deleteProfile, signOut, router, t]);

  const handleAppAbout = useCallback(() => {
    router.push("/screens/app-info");
  }, [router]);


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(24),
    },
    section: {
      marginBottom: verticalScale(32),
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: verticalScale(16),
      marginLeft: scale(4),
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader title={t("screenTitles.settings")} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("settings.sectionTitles.profile")}
          </Text>

          <ActionItem
            icon="person-outline"
            iconColor={theme.colors.primary}
            iconBgColor={`${theme.colors.primary}15`}
            title={t("settings.editProfile.title")}
            description={t("settings.editProfile.description")}
            type="navigation"
            onPress={handleEditProfile}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("settings.sectionTitles.preferences")}
          </Text>

          <ActionItem
            icon="language-outline"
            iconColor={theme.colors.success}
            iconBgColor={`${theme.colors.success}15`}
            title={t("settings.language.title")}
            description={t("settings.language.description")}
            type="navigation"
            onPress={handleLanguagePicker}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("settings.sectionTitles.account")}
          </Text>

          <ActionItem
            icon="log-out-outline"
            iconColor={theme.colors.warning}
            iconBgColor={`${theme.colors.warning}15`}
            title={t("settings.logout.title")}
            description={t("settings.logout.description")}
            type="navigation"
            onPress={handleLogout}
          />

          <ActionItem
            icon="trash-outline"
            iconColor={theme.colors.error}
            iconBgColor={`${theme.colors.error}15`}
            title={t("settings.deleteAccount.title")}
            description={t("settings.deleteAccount.description")}
            type="navigation"
            onPress={handleDeleteAccount}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("settings.sectionTitles.platformInfo")}
          </Text>

          <ActionItem
            icon="information-circle-outline"
            iconColor={theme.colors.info}
            iconBgColor={`${theme.colors.info}15`}
            title={t("settings.platformInfo.title")}
            description={t("settings.platformInfo.description")}
            type="navigation"
            onPress={handleAppAbout}
          />

          <ActionItem
            icon="heart"
            iconColor={theme.colors.secondary}
            iconBgColor={`${theme.colors.secondary}15`}
            title={t("settings.supportApp.title")}
            description={t("settings.supportApp.description")}
            type="navigation"
            onPress={handleSupportPress}
          />

          <ActionItem
            icon="mail-outline"
            iconColor={theme.colors.success}
            iconBgColor={`${theme.colors.info}15`}
            title={t("settings.contact.title")}
            description={t("settings.contact.description")}
            type="navigation"
            onPress={handleContactPress}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        icon="log-out-outline"
        description={t("confirmation.logout.description")}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        icon="trash-outline"
        description={t("confirmation.deleteAccount.description")}
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Language Picker */}
      <LanguagePicker
        ref={languagePickerRef}
        onLanguageChange={handleLanguageChange}
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
