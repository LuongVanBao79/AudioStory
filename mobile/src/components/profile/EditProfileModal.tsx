import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAuthStore } from "../../stores/useAuthStore";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Mode = "profile" | "password";

export default function EditProfileModal({ visible, onClose }: Props) {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();

  const [mode, setMode] = useState<Mode>("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reset khi mở lại
  useEffect(() => {
    if (visible) {
      setMode("profile");
      setName(user?.name ?? "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [visible]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống!");
      return;
    }
    try {
      await updateProfile({ name: name.trim() });
      Alert.alert("✅", "Cập nhật tên thành công!");
      onClose();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải từ 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert("✅", "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      onClose();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
            <TouchableOpacity
              onPress={
                mode === "profile" ? handleSaveProfile : handleChangePassword
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Text style={styles.save}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Mode switcher */}
          <View style={styles.modeSwitcher}>
            {(["profile", "password"] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                onPress={() => setMode(m)}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    mode === m && styles.modeBtnTextActive,
                  ]}
                >
                  {m === "profile" ? "Thông tin" : "Mật khẩu"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          {mode === "profile" ? (
            <View style={styles.form}>
              <Text style={styles.label}>Tên hiển thị</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên của bạn"
                maxLength={50}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry
              />
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Ít nhất 6 ký tự"
                secureTextEntry
              />
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  cancel: { fontSize: 16, color: "#999" },
  save: { fontSize: 16, color: "#FF6B6B", fontWeight: "700" },

  modeSwitcher: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#F4F5F7",
    borderRadius: 12,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  modeBtnActive: { backgroundColor: "#FFF" },
  modeBtnText: { fontSize: 14, color: "#999", fontWeight: "600" },
  modeBtnTextActive: { color: "#FF6B6B", fontWeight: "700" },

  form: { paddingHorizontal: 20, gap: 6 },
  label: { fontSize: 13, color: "#888", fontWeight: "600", marginTop: 10 },
  input: {
    backgroundColor: "#F4F5F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333",
  },
});
