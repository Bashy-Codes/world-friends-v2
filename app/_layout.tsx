import "react-native-reanimated";
import "react-native-gesture-handler";

import { Platform } from "react-native";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { SystemBarsProvider } from "@/providers/ThemeProvider";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { ThemeProvider, useTheme } from "@/lib/Theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/common/ToastConfig";
import "@/lib/i18n"

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

function AppContent() {
  const theme = useTheme();

  // Create navigation theme that maps existing theme
  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
    fonts: {
      regular: {
        fontFamily: "System",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "System",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "900" as const,
      },
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <ConvexAuthProvider
        client={convex}
        storage={
          Platform.OS === "android" || Platform.OS === "ios"
            ? secureStorage
            : undefined
        }
      >
        <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </ConvexAuthProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SystemBarsProvider>
          <AppContent />
        </SystemBarsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
