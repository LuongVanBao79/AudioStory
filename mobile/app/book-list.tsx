import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBookStore } from "../src/stores/useBookStore";
import { Book } from "../src/types";

import ViewModeModal, {
  ViewMode,
  SortMode,
} from "../src/components/ViewModeModal";
import {
  BookListItem,
  BookGridItem,
  BookQuickItem,
} from "../src/components/BookItems";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const GAP = 10;
const H_PAD = 16;

function useSortedBooks(books: Book[], sortMode: SortMode) {
  return useMemo(() => {
    const copy = [...books];
    if (sortMode === "most_read") {
      copy.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    } else {
      // updated: giữ thứ tự API trả về (hoặc sort theo updatedAt nếu có)
      copy.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );
    }
    return copy;
  }, [books, sortMode]);
}

// ─────────────────────────────────────────────────────────────
// Header bar
// ─────────────────────────────────────────────────────────────
function HeaderBar({
  title,
  viewMode,
  sortMode,
  onBack,
  onOpenModal,
}: {
  title: string;
  viewMode: ViewMode;
  sortMode: SortMode;
  onBack: () => void;
  onOpenModal: () => void;
}) {
  const VIEW_ICON: Record<ViewMode, string> = {
    list: "list-outline",
    grid: "grid-outline",
    quick: "apps-outline",
  };
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
      </TouchableOpacity>

      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      <TouchableOpacity
        onPress={onOpenModal}
        style={styles.iconBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name={VIEW_ICON[viewMode] as any} size={22} color="#1A1A2E" />
        {sortMode === "most_read" && <View style={styles.sortDot} />}
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Stats bar (tổng sách + sort label)
// ─────────────────────────────────────────────────────────────
function StatsBar({ count, sortMode }: { count: number; sortMode: SortMode }) {
  return (
    <View style={styles.statsBar}>
      <Text style={styles.resultCount}>{count} cuốn sách</Text>
      <View style={styles.sortBadge}>
        <Ionicons
          name={sortMode === "most_read" ? "flame-outline" : "time-outline"}
          size={12}
          color="#FF6B6B"
        />
        <Text style={styles.sortBadgeText}>
          {sortMode === "most_read" ? "Đọc nhiều" : "Mới nhất"}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Màn hình chính
// ─────────────────────────────────────────────────────────────
export default function BookListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    title?: string;
    category?: string;
    sort?: string;
    author?: string;
  }>();

  const {
    books,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchBooks,
    fetchMoreBooks,
  } = useBookStore();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [modalVisible, setModalVisible] = useState(false);

  const screenTitle = params.title ?? "Danh sách sách";

  // Tính toán width card theo chế độ
  const gridCardWidth = (width - H_PAD * 2 - GAP) / 2;
  const quickCardWidth = (width - H_PAD * 2 - GAP * 3) / 4;

  useEffect(() => {
    fetchBooks({
      category: params.category,
      sort: params.sort as any,
      limit: 20,
    });
  }, [params.category, params.sort]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    fetchMoreBooks({
      category: params.category,
      sort: params.sort as any,
      limit: 20,
    });
  }, [params, hasMore, isLoadingMore]);

  const handlePressBook = (book: Book) => {
    router.push(`/book/${book._id}`);
  };

  const sortedBooks = useSortedBooks(books, sortMode);

  // ── numColumns theo viewMode ─────────────────────────────────
  const numColumns = viewMode === "grid" ? 2 : viewMode === "quick" ? 4 : 1;

  // ── Key thay đổi khi numColumns đổi để FlatList re-render ──
  const flatListKey = `view-${viewMode}`;

  // ── Render item ──────────────────────────────────────────────
  const renderItem = ({ item }: { item: Book }) => {
    if (viewMode === "grid") {
      return (
        <BookGridItem
          book={item}
          onPress={handlePressBook}
          cardWidth={gridCardWidth}
        />
      );
    }
    if (viewMode === "quick") {
      return (
        <BookQuickItem
          book={item}
          onPress={handlePressBook}
          cardWidth={quickCardWidth}
        />
      );
    }
    return <BookListItem book={item} onPress={handlePressBook} />;
  };

  // ── Column wrapper style ─────────────────────────────────────
  const columnWrapperStyle =
    numColumns > 1
      ? {
          gap: GAP,
          paddingHorizontal: H_PAD,
          marginBottom: viewMode === "quick" ? 4 : 0,
        }
      : undefined;

  // ── Footer ───────────────────────────────────────────────────
  const renderFooter = () => {
    if (!isLoadingMore) return <View style={{ height: 100 }} />;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FF6B6B" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Ionicons name="library-outline" size={64} color="#E9ECEF" />
        <Text style={styles.emptyTitle}>Chưa có sách nào</Text>
        <Text style={styles.emptyHint}>
          Thể loại này chưa có sách, quay lại sau nhé!
        </Text>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar
        title={screenTitle}
        viewMode={viewMode}
        sortMode={sortMode}
        onBack={() => router.back()}
        onOpenModal={() => setModalVisible(true)}
      />

      {!isLoading && books.length > 0 && (
        <StatsBar count={sortedBooks.length} sortMode={sortMode} />
      )}

      {isLoading && books.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải sách...</Text>
        </View>
      ) : (
        <FlatList
          key={flatListKey}
          data={sortedBooks}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={columnWrapperStyle}
          contentContainerStyle={
            numColumns === 1 ? styles.listContent : styles.gridContent
          }
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}

      <ViewModeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        viewMode={viewMode}
        sortMode={sortMode}
        onChangeViewMode={setViewMode}
        onChangeSortMode={setSortMode}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

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
  iconBtn: { width: 36, alignItems: "center", position: "relative" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  sortDot: {
    position: "absolute",
    top: 0,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },

  // Stats bar
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultCount: { fontSize: 13, color: "#999", fontWeight: "500" },
  sortBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sortBadgeText: { fontSize: 12, color: "#FF6B6B", fontWeight: "600" },

  // List content
  listContent: { paddingHorizontal: H_PAD, paddingTop: 4 },
  gridContent: { paddingTop: 4 },

  // States
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#999", fontSize: 14 },
  empty: { paddingTop: 80, alignItems: "center", paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginTop: 16 },
  emptyHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },
  footerText: { color: "#999", fontSize: 13 },
});
