import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({
  message = "Không thể tải dữ liệu",
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>😕</Text>
      <Text style={styles.title}>Có lỗi xảy ra</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 30,
  },
  icon: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 8 },
  message: { fontSize: 15, color: "#888", textAlign: "center", lineHeight: 22 },
  retryBtn: {
    marginTop: 24,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
