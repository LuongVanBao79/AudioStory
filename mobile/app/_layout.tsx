import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../src/stores/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@onboarding_done";

export default function RootLayout() {
  const router = useRouter();
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [isReady, setIsReady] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Effect 1: Bootstrap — chỉ thu thập dữ liệu, không navigate
  useEffect(() => {
    async function bootstrap() {
      const [onboardingDone] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        restoreSession(),
      ]);

      if (onboardingDone) {
        setShouldRedirect(true); // đánh dấu cần redirect
      }

      setIsReady(true); // Stack mount sau đây
    }

    bootstrap();
  }, []);

  // Effect 2: Navigate — chỉ chạy SAU KHI Stack đã mount
  useEffect(() => {
    if (isReady && shouldRedirect) {
      router.replace("/(tabs)");
    }
  }, [isReady, shouldRedirect]); // ← chờ cả hai điều kiện

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
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
