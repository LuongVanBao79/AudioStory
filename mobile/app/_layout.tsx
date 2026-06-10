import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../src/stores/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

import { useFonts } from "expo-font";
import { Arimo_400Regular } from "@expo-google-fonts/arimo";
import { Bitter_400Regular } from "@expo-google-fonts/bitter";
import { AndadaPro_400Regular } from "@expo-google-fonts/andada-pro";
import { Lora_400Regular } from "@expo-google-fonts/lora";
import { NotoSans_400Regular } from "@expo-google-fonts/noto-sans";
import { Lato_400Regular } from "@expo-google-fonts/lato";
import { EBGaramond_400Regular } from "@expo-google-fonts/eb-garamond";
import { Tinos_400Regular } from "@expo-google-fonts/tinos";
import { Nunito_400Regular } from "@expo-google-fonts/nunito";

const ONBOARDING_KEY = "@onboarding_done";

export default function RootLayout() {
  const router = useRouter();
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [isReady, setIsReady] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const [fontsLoaded] = useFonts({
    Arimo: Arimo_400Regular,
    Bitter: Bitter_400Regular,
    "Andada Pro": AndadaPro_400Regular,
    Lora: Lora_400Regular,
    "Noto Sans": NotoSans_400Regular,
    Lato: Lato_400Regular,
    "EB Garamond": EBGaramond_400Regular,
    Tinos: Tinos_400Regular,
    Nunito: Nunito_400Regular,
  });

  useEffect(() => {
    async function bootstrap() {
      const [onboardingDone] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        restoreSession(),
      ]);
      if (onboardingDone) setShouldRedirect(true);
      setIsReady(true);
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (isReady && shouldRedirect) {
      router.replace("/(tabs)");
    }
  }, [isReady, shouldRedirect]);

  // ✅ Tất cả return điều kiện nằm SAU hooks
  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

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
