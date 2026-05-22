import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/useAuthStore";

export default function LoginScreen() {
  const router = useRouter();
  const { login, continueAsGuest, isLoading, error, clearError } =
    useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ email và mật khẩu");
      return;
    }

    try {
      await login({ email: email.trim(), password }); // ← đúng tên action
      router.replace("/(tabs)");
    } catch (err: any) {
      // Lỗi đã có trong store.error, Alert thêm cho rõ
      Alert.alert("Đăng nhập thất bại", err.message);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace("/(tabs)");
  };

  // Xoá lỗi khi user bắt đầu gõ lại
  const handleChangeEmail = (v: string) => {
    clearError();
    setEmail(v);
  };
  const handleChangePassword = (v: string) => {
    clearError();
    setPassword(v);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chào mừng trở lại! 👋</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục nghe AudioStory
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={handleChangeEmail}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={handleChangePassword}
          />

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={styles.linkText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        {/* Tiếp tục không cần đăng nhập */}
        <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
          <Text style={styles.guestText}>Tiếp tục không cần đăng nhập</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666" },
  form: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  loginBtnDisabled: { backgroundColor: "#FFAAAA" },
  loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  errorText: {
    color: "#E53E3E",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  footerText: { color: "#666", fontSize: 15 },
  linkText: { color: "#FF6B6B", fontSize: 15, fontWeight: "bold" },
  guestBtn: { alignItems: "center", paddingVertical: 12 },
  guestText: { color: "#999", fontSize: 14, textDecorationLine: "underline" },
});
