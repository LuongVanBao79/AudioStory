import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { userService } from "../../src/services/userService";
import EditProfileModal from "../../src/components/profile/EditProfileModal";

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
function formatMinutes(total: number): string {
  if (total <= 0) return "0p";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}p`;
  if (m === 0) return `${h}g`;
  return `${h}g ${m}p`;
}

interface Stats {
  totalBooks: number;
  completedBooks: number;
  totalMinutes: number;
  totalFavorites: number;
}

// ─────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderTopWidth: 3,
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  value: { fontSize: 20, fontWeight: "800" },
  label: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
    textAlign: "center",
  },
});

// ─────────────────────────────────────────────────────────────
// MenuItem
// ─────────────────────────────────────────────────────────────
function MenuItem({
  icon,
  title,
  subtitle,
  color,
  onPress,
  danger,
  hasBorder = true,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  color: string;
  onPress: () => void;
  danger?: boolean;
  hasBorder?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[menuStyles.item, hasBorder && menuStyles.border]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[menuStyles.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={19} color={color} />
      </View>
      <View style={menuStyles.text}>
        <Text style={[menuStyles.title, danger && { color: "#FF4757" }]}>
          {title}
        </Text>
        {subtitle && <Text style={menuStyles.subtitle}>{subtitle}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color="#CCC" />}
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: "#1A1A2E" },
  subtitle: { fontSize: 12, color: "#AAA", marginTop: 1 },
});

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [showEdit, setShowEdit] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isLoggedIn) return;
    setStatsLoading(true);
    userService
      .getMyStats()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [isLoggedIn]);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  const handleContact = () => {
    Alert.alert("Liên hệ & Góp ý", "Chọn hình thức liên hệ", [
      {
        text: "Gửi email",
        onPress: () =>
          Linking.openURL(
            "mailto:support@audiostory.vn?subject=Góp ý từ người dùng",
          ),
      },
      { text: "Huỷ", style: "cancel" },
    ]);
  };

  // ── Guest ────────────────────────────────────────────────────
  if (!isLoggedIn || !user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.guestWrap}>
          <View style={styles.guestIconWrap}>
            <Ionicons name="person" size={44} color="#FF6B6B" />
          </View>
          <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
          <Text style={styles.guestSub}>
            Đăng nhập để lưu lịch sử, yêu thích và theo dõi tiến độ đọc sách
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Đăng nhập / Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = user.name?.slice(0, 2).toUpperCase() ?? "U";

  // ── Logged in ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 + insets.bottom + 16 }}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Hồ sơ</Text>
        </View>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {/* Kiểm tra xem user có trường avatar hay không */}
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowEdit(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={15} color="#FF6B6B" />
            <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>
        </View>

        {/* ── Thống kê ── */}
        <View style={styles.statsWrap}>
          {statsLoading ? (
            <ActivityIndicator
              color="#FF6B6B"
              style={{ paddingVertical: 20 }}
            />
          ) : stats ? (
            <View style={styles.statsRow}>
              <StatCard
                icon="headset-outline"
                value={String(stats.totalBooks)}
                label="Đã nghe"
                color="#FF6B6B"
              />
              <StatCard
                icon="time-outline"
                value={formatMinutes(stats.totalMinutes)}
                label="Thời gian"
                color="#6C63FF"
              />
              <StatCard
                icon="checkmark-circle-outline"
                value={String(stats.completedBooks)}
                label="Hoàn thành"
                color="#00B894"
              />
              <StatCard
                icon="heart-outline"
                value={String(stats.totalFavorites)}
                label="Yêu thích"
                color="#F6AD55"
              />
            </View>
          ) : null}
        </View>

        {/* ── Tài khoản ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
          <View style={styles.card}>
            <MenuItem
              icon="person-outline"
              title="Thông tin cá nhân"
              subtitle="Tên hiển thị, ảnh đại diện"
              color="#FF6B6B"
              onPress={() => setShowEdit(true)}
            />
            <MenuItem
              icon="library-outline"
              title="Tủ sách của tôi"
              subtitle="Lịch sử nghe, yêu thích"
              color="#6C63FF"
              onPress={() => router.push("/(tabs)/library")}
              hasBorder={false}
            />
          </View>
        </View>

        {/* ── Hỗ trợ ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HỖ TRỢ</Text>
          <View style={styles.card}>
            <MenuItem
              icon="chatbubble-ellipses-outline"
              title="Liên hệ & Góp ý"
              subtitle="Gửi phản hồi cho chúng tôi"
              color="#00B894"
              onPress={handleContact}
            />
            <MenuItem
              icon="document-text-outline"
              title="Điều khoản sử dụng"
              color="#F6AD55"
              onPress={() => Linking.openURL("https://audiostory.vn/terms")}
              hasBorder={false}
            />
          </View>
        </View>

        {/* ── Đăng xuất ── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuItem
              icon="log-out-outline"
              title="Đăng xuất"
              color="#FF4757"
              onPress={handleLogout}
              danger
              hasBorder={false}
            />
          </View>
        </View>

        <Text style={styles.version}>AudioStory v1.0.0</Text>
      </ScrollView>

      <EditProfileModal visible={showEdit} onClose={() => setShowEdit(false)} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  screenTitle: { fontSize: 28, fontWeight: "800", color: "#1A1A2E" },

  // Profile card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  profileInfo: { flex: 1 },
  username: { fontSize: 17, fontWeight: "800", color: "#1A1A2E" },
  email: { fontSize: 13, color: "#AAA", marginTop: 2 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF6B6B15",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  editBtnText: { fontSize: 13, fontWeight: "700", color: "#FF6B6B" },

  // Stats
  statsWrap: { marginHorizontal: 16, marginTop: 14 },
  statsRow: { flexDirection: "row", gap: 10 },

  // Sections
  section: { marginTop: 22, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#BBB",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 2,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  version: {
    textAlign: "center",
    color: "#CCC",
    fontSize: 12,
    marginTop: 28,
  },

  // Guest
  guestWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 36,
  },
  guestIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#FF6B6B15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  guestTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A2E" },
  guestSub: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 32,
    lineHeight: 23,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  avatarWrap: {
    width: 60, // Bạn thay bằng độ rộng thực tế của bạn (ví dụ: 60)
    height: 60, // Bạn thay bằng độ cao thực tế của bạn (phải bằng width)
    borderRadius: 30, // BẮT BUỘC: Phải bằng đúng 1/2 kích thước ở trên (60 / 2 = 30)

    backgroundColor: "#FF6B6B", // Đây chính là màu cam/hồng nền cũ của bạn
    alignItems: "center",
    justifyContent: "center",

    // CỰC KỲ QUAN TRỌNG: Thuộc tính này sẽ cắt phẳng tất cả các góc vuông
    // tràn ra ngoài phạm vi hình tròn của thẻ cha, biến mọi thứ bên trong thành hình tròn
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%", // Chiếm trọn 100% chiều rộng của thẻ cha
    height: "100%", // Chiếm trọn 100% chiều cao của thẻ cha
    resizeMode: "cover", // Đảm bảo ảnh tự phóng to/thu nhỏ vừa khít không bị méo

    // Không cần dùng borderRadius ở đây nữa vì thẻ cha đã gánh nhiệm vụ cắt tròn rồi
  },
});
