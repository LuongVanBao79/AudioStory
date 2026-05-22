import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthorStore } from "../../src/stores/useAuthorStore";
import { Book } from "../../src/types/index";

// ─────────────────────────────────────────────────────────────
// Sub-component: Book item dạng ngang
// ─────────────────────────────────────────────────────────────
function AuthorBookItem({
  book,
  onPress,
}: {
  book: Book;
  onPress: (b: Book) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.bookItem}
      activeOpacity={0.78}
      onPress={() => onPress(book)}
    >
      <Image
        source={{ uri: book.coverImage }}
        style={styles.bookCover}
        resizeMode="cover"
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>

        {book.category && (
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{book.category.name}</Text>
          </View>
        )}

        <View style={styles.bookStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={12} color="#F6AD55" />
            <Text style={styles.statText}>
              {book.rating?.toFixed(1) ?? "0"}
            </Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.statItem}>
            <Ionicons name="headset-outline" size={12} color="#999" />
            <Text style={styles.statText}>
              {(book.listenCount ?? 0) >= 1000
                ? `${((book.listenCount ?? 0) / 1000).toFixed(1)}k`
                : (book.listenCount ?? 0)}
            </Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.statItem}>
            <Ionicons name="layers-outline" size={12} color="#999" />
            <Text style={styles.statText}>{book.totalChapters} chương</Text>
          </View>
          {book.isFull && (
            <>
              <View style={styles.dot} />
              <Text style={styles.fullText}>FULL</Text>
            </>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#DDD" />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Màn hình chính
// ─────────────────────────────────────────────────────────────
export default function AuthorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { selectedAuthor, isLoading, error, fetchAuthorById } =
    useAuthorStore();

  useEffect(() => {
    if (id) fetchAuthorById(id);
  }, [id]);

  const handlePressBook = (book: Book) => {
    router.navigate({
      pathname: "/book/[id]",
      params: { id: book._id },
    });
  };

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading && !selectedAuthor) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  // ── Error ───────────────────────────────────────────────────
  if (error || !selectedAuthor) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <View style={styles.center}>
          <Ionicons name="person-outline" size={60} color="#E9ECEF" />
          <Text style={styles.errorText}>Không tìm thấy tác giả</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchAuthorById(id!)}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Tác giả
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile tác giả */}
        <View style={styles.profile}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {selectedAuthor.avatarUrl ? (
              <Image
                source={{ uri: selectedAuthor.avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {selectedAuthor.name?.charAt(0)?.toUpperCase() ?? "A"}
                </Text>
              </View>
            )}
          </View>

          {/* Tên */}
          <Text style={styles.name}>{selectedAuthor.name}</Text>

          {/* Số sách */}
          <View style={styles.bookCountBadge}>
            <Ionicons name="library-outline" size={14} color="#FF6B6B" />
            <Text style={styles.bookCountText}>
              {selectedAuthor.bookCount ?? selectedAuthor.books?.length ?? 0}{" "}
              cuốn sách
            </Text>
          </View>

          {/* Bio */}
          {selectedAuthor.bio ? (
            <Text style={styles.bio}>{selectedAuthor.bio}</Text>
          ) : (
            <Text style={styles.bioEmpty}>Chưa có thông tin giới thiệu</Text>
          )}
        </View>

        {/* Danh sách sách */}
        <View style={styles.booksSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.titleAccent} />
              <Text style={styles.sectionTitle}>Tác phẩm</Text>
            </View>
            <Text style={styles.sectionCount}>
              {selectedAuthor.books?.length ?? 0} cuốn
            </Text>
          </View>

          {selectedAuthor.books?.length > 0 ? (
            selectedAuthor.books.map((book) => (
              <AuthorBookItem
                key={book._id}
                book={book}
                onPress={handlePressBook}
              />
            ))
          ) : (
            <View style={styles.emptyBooks}>
              <Ionicons name="book-outline" size={48} color="#E9ECEF" />
              <Text style={styles.emptyText}>Chưa có tác phẩm nào</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { width: 36, alignItems: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },

  // Profile
  profile: {
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  avatarWrap: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  avatarFallbackText: { fontSize: 40, fontWeight: "800", color: "#FFF" },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 10,
    textAlign: "center",
  },
  bookCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  bookCountText: { fontSize: 13, color: "#FF6B6B", fontWeight: "700" },

  bio: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    textAlign: "center",
  },
  bioEmpty: {
    fontSize: 14,
    color: "#BBB",
    fontStyle: "italic",
  },

  // Books section
  booksSection: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#FF6B6B",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1A1A2E" },
  sectionCount: { fontSize: 13, color: "#999" },

  // Book item
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
  },
  bookCover: {
    width: 58,
    height: 86,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  bookInfo: { flex: 1 },
  bookTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A2E",
    lineHeight: 20,
    marginBottom: 6,
  },
  catBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  catText: { fontSize: 11, color: "#FF6B6B", fontWeight: "600" },
  bookStats: { flexDirection: "row", alignItems: "center", gap: 5 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { fontSize: 11, color: "#888" },
  fullText: { fontSize: 10, color: "#FF6B6B", fontWeight: "800" },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#DDD",
  },

  // Empty / Error
  emptyBooks: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: { fontSize: 15, color: "#CCC", fontWeight: "600" },
  errorText: { fontSize: 16, color: "#333", fontWeight: "600" },
  retryBtn: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { color: "#FFF", fontWeight: "700" },
});
