import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

export default function AppInfoScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleConvexPress = () => {
    Linking.openURL("https://convex.dev");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["left", "right"]}>
      <ScreenHeader title={t("screenTitles.appInfo")} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            WorldFriends
          </Text>
        </View>

        {/* Convex Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("appInfo.sponseredBy")}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.imageContainer, { backgroundColor: "#eeeeeeff" }]}>
              <Image
                source={require("@/assets/images/convex.png")}
                style={styles.convexImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              {t("appInfo.convexDesc")}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={scale(20)} color={theme.colors.error} />
              <Text style={[styles.locationText, { color: theme.colors.textMuted }]}>
                San Francisco, CA 🇺🇸
              </Text>
            </View>
            <Button
              iconName="information-circle-sharp"
              text="About Convex"
              onPress={handleConvexPress}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("appInfo.aboutApp")}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              {t("appInfo.infoDesc")}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            {t("appInfo.footerText")}
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            {t("appInfo.appVersion")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(40),
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: verticalScale(32),
  },
  iconContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  logoImage: {
    width: scale(56),
    height: scale(56),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    marginBottom: verticalScale(8),
  },
  section: {
    marginBottom: verticalScale(32),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginBottom: verticalScale(16),
  },
  card: {
    borderRadius: moderateScale(16),
    padding: scale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    alignItems: "center",
    borderRadius: scale(48),
    padding: scale(10),
    marginBottom: verticalScale(12),
  },
  convexImage: {
    width: scale(180),
    height: scale(80),
  },
  cardText: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    textAlign: "center",
    marginBottom: verticalScale(12),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
  locationText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(4),
  },
});