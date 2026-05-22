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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    // Validate phía client trước
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      Alert.alert("Đăng ký thành công! 🎉", "Vui lòng đăng nhập để tiếp tục", [
        {
          text: "Đăng nhập ngay",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Đăng ký thất bại", err.message);
    }
  };

  const handleChangeName = (v: string) => {
    clearError();
    setName(v);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản mới 🚀</Text>
          <Text style={styles.subtitle}>
            Tham gia thế giới AudioStory ngay hôm nay
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên của bạn"
            value={name}
            onChangeText={handleChangeName}
          />

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
            placeholder="Ít nhất 6 ký tự"
            secureTextEntry
            value={password}
            onChangeText={handleChangePassword}
          />

          <TouchableOpacity
            style={[
              styles.registerBtn,
              isLoading && styles.registerBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.registerBtnText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.linkText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
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
  registerBtn: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  registerBtnDisabled: { backgroundColor: "#FFAAAA" },
  registerBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  errorText: {
    color: "#E53E3E",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#666", fontSize: 15 },
  linkText: { color: "#FF6B6B", fontSize: 15, fontWeight: "bold" },
});
