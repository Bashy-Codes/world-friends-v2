import "react-native-reanimated";
import "react-native-gesture-handler";

import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { Platform, StyleSheet, View, ActivityIndicator, Image, Text } from "react-native";
import { useTheme } from "@/lib/Theme";
import { api } from "@/convex/_generated/api";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { useEffect } from "react";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function Index() {
  const theme = useTheme();

  const currentUserId = useQuery(api.profiles.getCurrentUserId);
  const { initializeSDK } = useRevenueCat();

  // Initialize RevenueCat when user ID is available
  useEffect(() => {
    if (currentUserId && Platform.OS !== 'web') {
      initializeSDK(currentUserId);
    }
  }, [currentUserId, initializeSDK]);

  const AppLoading = () => (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={[styles.logoContainer, {backgroundColor: theme.colors.surface}]}>
         <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
      </View>
      <ActivityIndicator size="large" color={theme.colors.primary} style={{marginBottom: verticalScale(24),}}/>
    </View>
  );

  return (
    <>
      <AuthLoading>
        <AppLoading />
      </AuthLoading>

      <Unauthenticated>
        <Redirect href="/(auth)" />
      </Unauthenticated>

      <Authenticated>
        <Redirect href="/(tabs)" />
      </Authenticated>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(86),
  },
  logo: {
    width: scale(80),
    height: scale(80),
  },
});
