import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReminderModal from "../ReminderModal";
import { useReadingReminder } from "../../hooks/useReadingReminder";

interface Props {
  userName?: string;
  onNotificationPress?: () => void;
}

export default function HomeHeader({ userName, onNotificationPress }: Props) {
  const [showReminder, setShowReminder] = useState(false);
  const { settings } = useReadingReminder();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <>
      <View style={styles.container}>
        <View>
          <Text style={styles.greeting}>
            {greeting()} {userName ? `${userName} 👋` : "bạn 👋"}
          </Text>
          <Text style={styles.subtitle}>Hôm nay bạn muốn nghe sách gì?</Text>
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => setShowReminder(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={settings.enabled ? "notifications" : "notifications-outline"}
            size={24}
            color={settings.enabled ? "#6C63FF" : "#333"}
          />
          {/* Badge hiển thị khi nhắc nhở đang bật */}
          {settings.enabled && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ReminderModal
        visible={showReminder}
        onClose={() => setShowReminder(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
});
