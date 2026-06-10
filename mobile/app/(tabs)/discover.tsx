import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useBookStore } from "../../src/stores/useBookStore";
import { useCategoryStore } from "../../src/stores/useCategoryStore";
import { Book, Category } from "../../src/types";

import SearchBar from "../../src/components/discover/SearchBar";
import CategoryGrid from "../../src/components/discover/CategoryGrid";
import SearchResultItem from "../../src/components/discover/SearchResultItem";

// Định nghĩa Type chính xác cho API
type SortType = "rating" | "newest" | "top-view" | "top-listen";

// Các tùy chọn Sort (Giữ lại tính năng Lọc)
const SORT_OPTIONS: { id: SortType; label: string }[] = [
  { id: "top-view", label: "Lượt xem 🔥" },
  { id: "top-listen", label: "Lượt nghe 🎧" },
  { id: "rating", label: "Đánh giá ⭐" },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; sort?: SortType }>();
  const insets = useSafeAreaInsets();

  // ── Stores ──────────────────────────────────────────────────
  const {
    books,
    fetchBooks,
    fetchMoreBooks,
    isLoading,
    isLoadingMore,
    hasMore,
  } = useBookStore();

  const { categories, fetchCategories } = useCategoryStore();

  // ── Local state ─────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [activeSort, setActiveSort] = useState<SortType | null>(null);

  // Lưu lại params hiện tại để truyền cho hàm Load More
  const [currentParams, setCurrentParams] = useState<any>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch categories 1 lần ──────────────────────────────────
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, []);

  // ── Xử lý param truyền từ trang Home (nếu có) ───────────────
  useEffect(() => {
    if (params.sort) {
      setActiveSort(params.sort);
      const queryParams = { sort: params.sort };
      setCurrentParams(queryParams);
      fetchBooks(queryParams);
    }
  }, [params.sort]);

  // ── Logic gọi API (Debounce) ────────────────────────────────
  const triggerSearch = async (
    searchText: string,
    sortValue: SortType | null,
  ) => {
    const queryParams: any = {};

    // Gửi searchText chung lên API, backend sẽ tự động tìm trong cả Tên sách và Tác giả
    if (searchText) {
      queryParams.search = searchText;
    }

    if (sortValue) {
      queryParams.sort = sortValue;
    }

    // Nếu rỗng hoàn toàn thì clear danh sách
    if (!searchText && !sortValue) {
      setCurrentParams({});
      return;
    }

    setCurrentParams(queryParams);
    await fetchBooks(queryParams);
  };

  useEffect(() => {
    if (params.sort && !query && activeSort === params.sort) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      triggerSearch(query.trim(), activeSort);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeSort]);

  // ── Handlers ────────────────────────────────────────────────
  const handleClear = () => {
    setQuery("");
    setActiveSort(null);
    setCurrentParams({});
    Keyboard.dismiss();
  };

  const handlePressBook = (book: Book) => {
    router.push(`/book/${book._id}`);
  };

  const handlePressCategory = (cat: Category) => {
    router.push(`/book-list?category=${cat._id}&title=${cat.name}`);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchMoreBooks(currentParams);
    }
  };

  const isSearchingOrSorting = query.trim().length > 0 || activeSort !== null;
  const showEmpty = isSearchingOrSorting && !isLoading && books.length === 0;

  // ── Render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header + SearchBar */}
      <View style={styles.header}>
        <Text style={styles.title}>Khám phá</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={handleClear}
          placeholder="Tìm tên sách hoặc tác giả..."
        />

        {/* Bộ lọc Sắp xếp */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <View style={styles.filterGroup}>
              {SORT_OPTIONS.map((sort) => (
                <TouchableOpacity
                  key={sort.id}
                  style={[
                    styles.chip,
                    activeSort === sort.id && styles.chipActiveSort,
                  ]}
                  onPress={() =>
                    setActiveSort(activeSort === sort.id ? null : sort.id)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      activeSort === sort.id && styles.chipTextActiveSort,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Nội dung chính */}
      <View style={styles.body}>
        {/* Đang search loading lần đầu */}
        {isSearchingOrSorting && isLoading && books.length === 0 && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.hint}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {/* Không tìm thấy */}
        {showEmpty && (
          <View style={styles.center}>
            <Ionicons name="search-outline" size={64} color="#E9ECEF" />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyHint}>
              Thử thay đổi từ khóa hoặc bộ lọc nhé
            </Text>
          </View>
        )}

        {/* Kết quả search / filter */}
        {isSearchingOrSorting && books.length > 0 && (
          <FlatList
            data={books}
            // Fix lỗi Key trùng lặp ở đây bằng cách thêm index
            keyExtractor={(item, index) => `${item._id}-${index}`}
            renderItem={({ item }) => (
              <SearchResultItem book={item} onPress={handlePressBook} />
            )}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 60 + insets.bottom + 16,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                Tìm thấy kết quả {query ? `cho "${query}"` : ""}
              </Text>
            }
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator
                  style={{ marginVertical: 20 }}
                  color="#FF6B6B"
                />
              ) : null
            }
          />
        )}

        {/* Lưới thể loại — hiển thị khi chưa search/lọc gì */}
        {!isSearchingOrSorting && !isLoading && (
          <CategoryGrid categories={categories} onPress={handlePressCategory} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: {
    backgroundColor: "#FFF",
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.3,
    marginBottom: 14,
  },

  filterSection: {
    marginTop: 12,
    marginHorizontal: -20,
  },
  filterScroll: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  filterGroup: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F1F3F5",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActiveSort: {
    backgroundColor: "#FFF0F6",
    borderColor: "#FF6B6B",
  },
  chipText: {
    fontSize: 13,
    color: "#495057",
    fontWeight: "500",
  },
  chipTextActiveSort: {
    color: "#D6336C",
    fontWeight: "700",
  },

  body: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  hint: { color: "#999", marginTop: 12, fontSize: 14 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
  },
  emptyHint: { fontSize: 14, color: "#999", marginTop: 6, textAlign: "center" },

  resultCount: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
    fontWeight: "500",
  },
});
