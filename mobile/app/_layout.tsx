import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../src/stores/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@onboarding_done";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      // Chạy song song: restore session + check onboarding
      const [onboardingDone] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        restoreSession(),
      ]);

      if (onboardingDone) {
        // Đã từng vào app → vào thẳng tabs
        router.replace("/(tabs)");
      }
      // Chưa onboard → giữ nguyên ở index.tsx (WelcomeScreen)

      setIsReady(true);
    }

    bootstrap();
  }, []);

  // Chặn render cho đến khi bootstrap xong, tránh flash màn hình
  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Màn hình chào đón — chỉ hiện 1 lần */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="chapter/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="book-list" options={{ headerShown: false }} />
        <Stack.Screen name="author/[id]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
