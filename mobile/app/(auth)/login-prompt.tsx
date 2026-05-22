// app/auth/login-prompt.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function LoginPromptScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>Đăng nhập để tiếp tục</Text>
      <Text style={styles.subtitle}>
        Lưu tiến độ, yêu thích sách và nhiều tính năng thú vị khác
      </Text>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.loginText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerBtn}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.registerText}>Tạo tài khoản mới</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipBtn} onPress={() => router.back()}>
        <Text style={styles.skipText}>Để sau</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8F9FA",
  },
  icon: { fontSize: 60, marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 35,
    lineHeight: 22,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loginText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  registerBtn: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  registerText: { color: "#FF6B6B", fontWeight: "bold", fontSize: 16 },
  skipBtn: { marginTop: 20 },
  skipText: { color: "#999", fontSize: 14 },
});
