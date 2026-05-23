import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../../src/stores/useAuthStore";
import { useUserStore } from "../../src/stores/useUserStore";
import { useFavoriteStore } from "../../src/stores/useFavoriteStore";
import { Book, ReadingProgress } from "../../src/types";

// ─────────────────────────────────────────────────────────────
type TabType = "listening" | "reading" | "favorites";

// ── Helper format giây → m:ss ─────────────────────────────────
const formatTime = (seconds: number): string => {
  if (!seconds) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ─────────────────────────────────────────────────────────────
// Sub-component: Listening Item
// audioPosition > 0 && !isCompleted
// ─────────────────────────────────────────────────────────────
function ListeningItem({
  item,
  onPress,
}: {
  item: ReadingProgress;
  onPress: (chapterId: string, audioPosition: number) => void;
}) {
  const book = item.book;
  const chapter = item.chapter;
  const percent = chapter?.duration
    ? Math.min(100, Math.round((item.audioPosition / chapter.duration) * 100))
    : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.78}
      onPress={() => onPress(chapter._id, item.audioPosition)}
    >
      <Image source={{ uri: book.coverImage }} style={styles.cover} />

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {book.author?.name ?? "AudioStory"}
        </Text>

        <View style={styles.chapterRow}>
          <Ionicons name="headset-outline" size={13} color="#FF6B6B" />
          <Text style={styles.chapterText} numberOfLines={1}>
            Chương {chapter?.chapterNumber} • {chapter?.title}
          </Text>
        </View>

        {/* Progress bar + % */}
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressPct}>{percent}%</Text>
        </View>

        {/* Vị trí đang nghe */}
        {item.audioPosition > 0 && (
          <Text style={styles.positionText}>
            Đang nghe tại {formatTime(item.audioPosition)}
            {chapter?.duration ? ` / ${formatTime(chapter.duration)}` : ""}
          </Text>
        )}
      </View>

      <Ionicons name="play-circle" size={32} color="#FF6B6B" />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Reading Item
// audioPosition === 0 && !isCompleted
// ─────────────────────────────────────────────────────────────
function ReadingItem({
  item,
  onPress,
}: {
  item: ReadingProgress;
  onPress: (chapterId: string) => void;
}) {
  const book = item.book;
  const chapter = item.chapter;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.78}
      onPress={() => onPress(chapter._id)}
    >
      <Image source={{ uri: book.coverImage }} style={styles.cover} />

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {book.author?.name ?? "AudioStory"}
        </Text>

        <View style={styles.chapterRow}>
          <Ionicons name="book-outline" size={13} color="#4A90D9" />
          <Text
            style={[styles.chapterText, { color: "#4A90D9" }]}
            numberOfLines={1}
          >
            Chương {chapter?.chapterNumber} • {chapter?.title}
          </Text>
        </View>

        <View style={styles.readingBadge}>
          <View style={styles.readingDot} />
          <Text style={styles.readingBadgeText}>Đang đọc</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward-circle" size={32} color="#4A90D9" />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: Favorite Item
// ─────────────────────────────────────────────────────────────
function FavoriteItem({
  book,
  onPress,
  onRemove,
}: {
  book: Book;
  onPress: (book: Book) => void;
  onRemove: (bookId: string) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.78}
      onPress={() => onPress(book)}
    >
      <Image source={{ uri: book.coverImage }} style={styles.cover} />

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {book.author?.name ?? "AudioStory"}
        </Text>

        {book.category && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{book.category.name}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <Ionicons name="star" size={12} color="#F6AD55" />
          <Text style={styles.statText}>{book.rating?.toFixed(1) ?? "0"}</Text>

          <View style={styles.dot} />

          <Ionicons name="headset-outline" size={12} color="#999" />
          <Text style={styles.statText}>
            {(book.listenCount ?? 0) >= 1000
              ? `${((book.listenCount ?? 0) / 1000).toFixed(1)}k`
              : (book.listenCount ?? 0)}
          </Text>

          <View style={styles.dot} />

          <Ionicons name="layers-outline" size={12} color="#999" />
          <Text style={styles.statText}>{book.totalChapters} chương</Text>

          {book.isFull && (
            <>
              <View style={styles.dot} />
              <Text style={styles.fullText}>FULL</Text>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(book._id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.removeBtn}
      >
        <Ionicons name="heart" size={22} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Màn hình chính
// ─────────────────────────────────────────────────────────────
export default function LibraryScreen() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const insets = useSafeAreaInsets();

  const { history, isLoading: historyLoading, fetchMyHistory } = useUserStore();
  const {
    favorites,
    isLoading: favLoading,
    fetchFavorites,
    toggleFavorite,
  } = useFavoriteStore();

  const [activeTab, setActiveTab] = useState<TabType>("listening");
  const [refreshing, setRefreshing] = useState(false);

  // ── Phân loại history theo quy ước audioPosition ─────────────
  // Đang nghe:  audioPosition > 0  && !isCompleted
  // Đang đọc:   audioPosition === 0 && !isCompleted
  const listeningList = history.filter(
    (p) => p.audioPosition > 0 && !p.isCompleted,
  );
  const readingList = history.filter(
    (p) => p.audioPosition === 0 && !p.isCompleted,
  );

  // ── Fetch mỗi lần focus vào tab ──────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) return;
      fetchMyHistory();
      fetchFavorites();
    }, [isLoggedIn]),
  );

  // ── Pull-to-refresh ──────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchMyHistory(), fetchFavorites()]);
    setRefreshing(false);
  }, []);

  // ── Navigate handlers ────────────────────────────────────────
  const handlePressListening = (chapterId: string, audioPosition: number) => {
    router.push({
      pathname: "/chapter/[id]",
      params: { id: chapterId, startPosition: String(audioPosition * 1000) },
    });
  };

  const handlePressReading = (chapterId: string) => {
    router.push({ pathname: "/chapter/[id]", params: { id: chapterId } });
  };

  const handlePressFavorite = (book: Book) => {
    router.push(`/book/${book._id}`);
  };

  const handleRemoveFavorite = async (bookId: string) => {
    await toggleFavorite(bookId);
  };

  // ── Guest state ──────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tủ sách</Text>
        </View>
        <View style={styles.guestWrap}>
          <Ionicons name="library-outline" size={80} color="#E9ECEF" />
          <Text style={styles.guestTitle}>Tủ sách trống</Text>
          <Text style={styles.guestSub}>
            Đăng nhập để lưu lịch sử nghe, sách yêu thích và đồng bộ trên mọi
            thiết bị
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => router.push("/(tabs)/discover")}
          >
            <Text style={styles.discoverBtnText}>Khám phá sách</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Data / loading theo tab ──────────────────────────────────
  const isLoading = activeTab === "favorites" ? favLoading : historyLoading;

  const dataMap: Record<TabType, any[]> = {
    listening: listeningList,
    reading: readingList,
    favorites,
  };
  const data = dataMap[activeTab];

  // ── Tab config ───────────────────────────────────────────────
  const tabs: { key: TabType; label: string; accent: string; count: number }[] =
    [
      {
        key: "listening",
        label: "Đang nghe",
        accent: "#FF6B6B",
        count: listeningList.length,
      },
      {
        key: "reading",
        label: "Đang đọc",
        accent: "#4A90D9",
        count: readingList.length,
      },
      {
        key: "favorites",
        label: "Yêu thích",
        accent: "#FF6B6B",
        count: favorites.length,
      },
    ];

  // ── Empty state ──────────────────────────────────────────────
  const emptyConfig: Record<
    TabType,
    { icon: string; msg: string; hint: string }
  > = {
    listening: {
      icon: "headset-outline",
      msg: "Không có sách đang nghe dở",
      hint: "Mở một chương và bấm play để bắt đầu nghe",
    },
    reading: {
      icon: "book-outline",
      msg: "Không có sách đang đọc dở",
      hint: "Mở một chương và bắt đầu đọc để lưu vào đây",
    },
    favorites: {
      icon: "heart-outline",
      msg: "Chưa có sách yêu thích",
      hint: "Bấm ❤️ ở màn hình sách để lưu vào đây",
    },
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    const { icon, msg, hint } = emptyConfig[activeTab];
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name={icon as any} size={64} color="#E9ECEF" />
        <Text style={styles.emptyTitle}>{msg}</Text>
        <Text style={styles.emptyHint}>{hint}</Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => router.push("/(tabs)/discover")}
        >
          <Ionicons name="compass-outline" size={16} color="#FF6B6B" />
          <Text style={styles.exploreBtnText}>Khám phá sách</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render item ──────────────────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === "listening")
      return <ListeningItem item={item} onPress={handlePressListening} />;
    if (activeTab === "reading")
      return <ReadingItem item={item} onPress={handlePressReading} />;
    return (
      <FavoriteItem
        book={item}
        onPress={handlePressFavorite}
        onRemove={handleRemoveFavorite}
      />
    );
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tủ sách</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map(({ key, label, accent, count }) => {
          const isActive = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.tab,
                isActive && { borderBottomColor: accent, borderBottomWidth: 3 },
              ]}
              onPress={() => setActiveTab(key)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && { color: accent, fontWeight: "700" },
                ]}
              >
                {label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    { backgroundColor: isActive ? accent : "#DDD" },
                  ]}
                >
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {isLoading && data.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item: any) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 60 + insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FF6B6B"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFF",
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1A1A2E" },

  // Tabs — giống hệt gốc, chỉ bỏ marginRight cố định → dùng flex
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 28,
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 15, color: "#999", fontWeight: "600" },
  tabBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },

  // Card — GIỮ NGUYÊN như gốc
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cover: {
    width: 68,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  cardInfo: { flex: 1, marginLeft: 14, gap: 5 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A2E",
    lineHeight: 20,
  },
  cardSub: { fontSize: 12, color: "#999" },

  // Listening specific
  chapterRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  chapterText: { fontSize: 12, color: "#666", flex: 1 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#F0F0F0",
  },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: "#FF6B6B" },
  progressPct: { fontSize: 11, color: "#FF6B6B", fontWeight: "700", width: 30 },
  positionText: {
    fontSize: 11,
    color: "#FF6B6B",
    fontWeight: "500",
    marginTop: 4,
  },

  // Reading specific
  readingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  readingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90D9",
  },
  readingBadgeText: { fontSize: 11, color: "#4A90D9", fontWeight: "700" },

  // Favorite specific
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, color: "#FF6B6B", fontWeight: "600" },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontSize: 11, color: "#888" },
  fullText: { fontSize: 10, color: "#FF6B6B", fontWeight: "800" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#DDD" },
  removeBtn: { padding: 4 },

  // States
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginTop: 16 },
  emptyHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
  },
  exploreBtnText: { color: "#FF6B6B", fontWeight: "700", fontSize: 14 },

  // Guest
  guestWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A2E",
    marginTop: 20,
  },
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
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  discoverBtn: {
    width: "100%",
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
  },
  discoverBtnText: { color: "#FF6B6B", fontSize: 16, fontWeight: "700" },
});
