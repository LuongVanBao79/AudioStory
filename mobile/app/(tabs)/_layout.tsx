import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/useAuthStore";

export default function TabLayout() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopColor: "#F0F0F0",
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: "Khám phá",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />

      {/* Tủ sách — Guest bấm vào sẽ bị redirect */}
      <Tabs.Screen
        name="library"
        options={{
          title: "Tủ sách",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "library" : "library-outline"}
              size={24}
              color={isLoggedIn ? color : "#CCC"} // Xám nếu chưa login
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault(); // Chặn chuyển tab
              router.push("/(auth)/login-prompt");
            }
          },
        }}
      />

      {/* Cá nhân — Guest bấm vào sẽ bị redirect */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={isLoggedIn ? color : "#CCC"}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              router.push("/(auth)/login-prompt");
            }
          },
        }}
      />
    </Tabs>
  );
}
