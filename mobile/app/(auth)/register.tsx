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
import { Ionicons } from "@expo/vector-icons"; // Import icon từ thư viện của Expo
import { useAuthStore } from "../../src/stores/useAuthStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hàm validate format email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Validate phía client trước
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert("Lỗi", "Email không đúng định dạng");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
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
  const handleChangeConfirmPassword = (v: string) => {
    clearError();
    setConfirmPassword(v);
  };

  return (
    // Thay đường dẫn ảnh dưới đây bằng file ảnh background thực tế của bạn
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
          <View style={styles.overlay}>
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ít nhất 6 ký tự"
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

              <Text style={styles.label}>Nhập lại mật khẩu</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Xác nhận lại mật khẩu"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={handleChangeConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Lớp phủ giúp text dễ đọc hơn trên nền ảnh
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
    backgroundColor: "#F8F9FA",
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
    backgroundColor: "#F8F9FA",
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
  registerBtn: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  registerBtnDisabled: { backgroundColor: "#FFAAAA" },
  registerBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  errorText: {
    color: "#E53E3E",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  footerText: { color: "#666", fontSize: 15 },
  linkText: { color: "#FF6B6B", fontSize: 15, fontWeight: "bold" },
});
