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
  ImageBackground,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Import icon của Expo
import { useAuthStore } from "../../src/stores/useAuthStore";

export default function LoginScreen() {
  const router = useRouter();
  const { login, continueAsGuest, isLoading, error, clearError } =
    useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  // Hàm validate format email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ email và mật khẩu");
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert("Lỗi", "Email không đúng định dạng");
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Đăng nhập thất bại", err.message);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace("/(tabs)");
  };

  const handleChangeEmail = (v: string) => {
    clearError();
    setEmail(v);
  };
  const handleChangePassword = (v: string) => {
    clearError();
    setPassword(v);
  };

  return (
    // Thay đường dẫn URI bằng ảnh thực tế của bạn hoặc dùng require('../../assets/...')
    <ImageBackground
      source={require("../../assets/images/backgroundappuser.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          {/* Lớp phủ (Overlay) trong suốt */}
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Chào mừng trở lại! 👋</Text>
              <Text style={styles.subtitle}>
                Đăng nhập để tiếp tục nghe truyện
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Nhập mật khẩu"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={handleChangePassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

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
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/register")}
              >
                <Text style={styles.linkText}>Đăng ký</Text>
              </TouchableOpacity>
            </View>

            {/* Tiếp tục không cần đăng nhập */}
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
              <Text style={styles.guestText}>Tiếp tục không cần đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Form màu trắng mờ 85%
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: { marginBottom: 30, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#666", textAlign: "center" },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Ô nhập liệu trắng mờ 50%
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Khung mật khẩu trắng mờ 50%
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
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
  guestBtn: { alignItems: "center", paddingVertical: 10 },
  guestText: { color: "#666", fontSize: 14, textDecorationLine: "underline" },
});
