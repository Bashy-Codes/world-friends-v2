import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create-profile" options={{ headerShown: false }} />
      <Stack.Screen name="create-post" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="app-info" options={{ headerShown: false }} />
      <Stack.Screen name="user-profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="collection/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="report" options={{ headerShown: false }} />
      <Stack.Screen name="letter/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="compose-letter" options={{ headerShown: false }} />
      <Stack.Screen name="support" options={{ headerShown: false }} />
    </Stack>
  );
}
