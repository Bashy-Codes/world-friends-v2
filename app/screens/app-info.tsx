import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { ActionItem } from "@/components/common/ActionItem";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

export default function AppInfoScreen() {
  const theme = useTheme();
  const { t } = useTranslation();


  const handleConvexPress = () => {
    Linking.openURL("https://convex.dev");
  };

  const handleEmailPress = () => {
    Linking.openURL("mailto:hello@worldfriends.app");
  };


  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader title={t("screenTitles.appInfo")} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            WorldFriends
          </Text>
        </View>

        {/* Convex Section*/}
        <View style={styles.convexSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("appInfo.sponseredBy")}
          </Text>
          <View
            style={[
              styles.convexCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary + "30",
              },
            ]}
          >
            <View style={styles.convexImageContainer}>
              <Image
                source={require("@/assets/images/convex.png")}
                style={styles.convexImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.convexDescription, { color: theme.colors.textSecondary }]}>
             {t("appInfo.convexDesc")}
            </Text>
            <View style={styles.convexLocationContainer}>
              <Ionicons
                name="location-outline"
                size={scale(16)}
                color={theme.colors.error}
              />
              <Text style={[styles.convexLocation, { color: theme.colors.textMuted }]}>
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
          <View
            style={[
              styles.aboutCard,
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.aboutText, { color: theme.colors.text }]}>
               {t("appInfo.infoDesc")}
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t("appInfo.getInTouch")}
          </Text>
         <ActionItem
            icon="mail-outline"
            iconColor={theme.colors.success}
            iconBgColor={`${theme.colors.info}15`}
            title={t("settings.contact.title")}
            description={t("settings.contact.description")}
            type="navigation"
            onPress={handleEmailPress}
          />
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
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: verticalScale(32),
  },
  logoContainer: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16)
  },
  logoImage: {
    width: scale(80),
    height: scale(80),
  },
  appName: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    marginBottom: verticalScale(8),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  location: {
    fontSize: moderateScale(14),
    fontWeight: "400",
  },
  section: {
    marginBottom: verticalScale(32),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginBottom: verticalScale(16),
  },
  infoCard: {
    borderRadius: scale(16),
    borderWidth: 1,
    marginBottom: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(16),
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginBottom: verticalScale(4),
  },
  cardDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  aboutCard: {
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutText: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingTop: verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerText: {
    fontSize: moderateScale(12),
    textAlign: "center",
    marginBottom: verticalScale(4),
  },
  // Convex Section Styles
  convexSection: {
    marginBottom: verticalScale(40),
    paddingVertical: verticalScale(20),
    
  },
  convexImageContainer: {
   backgroundColor: "#eeeeeeff",
    width: scale(200),
    height: scale(100),
    borderRadius: scale(50),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  convexImage: {
    width: scale(180),
    height: scale(80),
  },
  convexCard: {
    alignItems: "center",
    borderRadius: scale(20),
    borderWidth: 2,
    padding: scale(24),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  convexDescription: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  convexLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(4),
    marginBottom: verticalScale(24),
  },
  convexLocation: {
    fontSize: moderateScale(14),
    fontWeight: "500",
  }
});
