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
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUserStore } from "@/src/stores/useUserStore";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Mode = "profile" | "password";

export default function EditProfileModal({ visible, onClose }: Props) {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const { updateAvatar } = useUserStore();

  const [mode, setMode] = useState<Mode>("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // 1. THÊM STATE KHÓA NÚT CỤC BỘ ĐỂ CHẶN CLICK LIÊN TỤC
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (visible) {
      setMode("profile");
      setName(user?.name ?? "");
      setAvatarUri(null);
      setIsSubmitting(false); // Reset lại biến khóa
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [visible, user]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Quyền truy cập", "Bạn cần cấp quyền truy cập thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6, // Giảm nhẹ xuống 0.6 để ảnh nhẹ hơn, upload nhanh hơn nữa
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống!");
      return;
    }

    // KHÓA NÚT NGAY LẬP TỨC KHÔNG CHO ẤN LẦN 2
    setIsSubmitting(true);

    try {
      // 1. Upload ảnh lên Cloudinary trước (nếu có chọn ảnh mới)
      if (avatarUri) {
        if (updateAvatar) {
          await updateAvatar(avatarUri);
        }
      }

      // 2. Cập nhật tên
      if (name.trim() !== user?.name) {
        await updateProfile({ name: name.trim() });
      }

      Alert.alert("✅", "Cập nhật hồ sơ thành công!");
      onClose();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Có lỗi xảy ra");
    } finally {
      // Xử lý xong xuôi (Thành công hoặc Thất bại) thì mới mở khóa nút
      setIsSubmitting(false);
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

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert("✅", "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      onClose();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kết hợp cả loading của store và submitting cục bộ để hiển thị UI ổn định nhất
  const isGlobalLoading = isLoading || isSubmitting;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={isGlobalLoading}>
              <Text style={styles.cancel}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>

            {/* SỬA ĐÂY: Disable nút bấm khi đang xử lý */}
            <TouchableOpacity
              onPress={
                mode === "profile" ? handleSaveProfile : handleChangePassword
              }
              disabled={isGlobalLoading}
            >
              {isGlobalLoading ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Text style={styles.save}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ... Các phần Mode switcher và Form bên dưới giữ nguyên vẹn ... */}
          <View style={styles.modeSwitcher}>
            {(["profile", "password"] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                onPress={() => !isGlobalLoading && setMode(m)}
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

          {mode === "profile" ? (
            <View style={styles.form}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.avatarWrapper}
                  disabled={isGlobalLoading}
                >
                  <Image
                    source={{
                      uri:
                        avatarUri ||
                        user?.avatar ||
                        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.cameraIconBadge}>
                    <Text style={styles.cameraIconText}>📷</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Tên hiển thị</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên của bạn"
                maxLength={50}
                editable={!isGlobalLoading}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                editable={!isGlobalLoading}
              />
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!isGlobalLoading}
              />
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isGlobalLoading}
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
  avatarContainer: { alignItems: "center", marginVertical: 10 },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E0E0E0",
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  cameraIconText: { fontSize: 12 },
});
