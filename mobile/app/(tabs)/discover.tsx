import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useBookStore } from "../../src/stores/useBookStore";
import { useCategoryStore } from "../../src/stores/useCategoryStore";
import { Book, Category } from "../../src/types";

import SearchBar from "../../src/components/discover/SearchBar";
import CategoryGrid from "../../src/components/discover/CategoryGrid";
import SearchResultItem from "../../src/components/discover/SearchResultItem";
import { FlatList } from "react-native";

export default function DiscoverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; sort?: string }>();

  // ── Stores ──────────────────────────────────────────────────
  const { books, fetchBooks, isLoading } = useBookStore();
  const { categories, fetchCategories } = useCategoryStore();

  // ── Local state ─────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch categories 1 lần ──────────────────────────────────
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, []);

  // ── Xử lý param từ Home (category / sort) ───────────────────
  useEffect(() => {
    if (params.sort) {
      fetchBooks({ sort: params.sort as any });
    }
  }, [params.sort]);

  // ── Debounce search — gọi API thật, không filter local ──────
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      await fetchBooks({ search: query.trim() });
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Khi books store thay đổi → cập nhật results
  useEffect(() => {
    if (query.trim()) setResults(books);
  }, [books]);

  // ── Handlers ────────────────────────────────────────────────
  const handleClear = () => {
    setQuery("");
    setResults([]);
    Keyboard.dismiss();
  };

  const handlePressBook = (book: Book) => {
    router.push(`/book/${book._id}`);
  };

  const handlePressCategory = (cat: Category) => {
    router.push(`/book-list?category=${cat._id}&title=${cat.name}`);
  };

  const isSearching = query.trim().length > 0;
  const showEmpty = isSearching && !isLoading && results.length === 0;

  // ── Render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header + SearchBar */}
      <View style={styles.header}>
        <Text style={styles.title}>Khám phá</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={handleClear}
        />
      </View>

      {/* Nội dung thay đổi theo trạng thái */}
      <View style={styles.body}>
        {/* Đang search loading */}
        {isSearching && isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.hint}>Đang tìm kiếm...</Text>
          </View>
        )}

        {/* Không tìm thấy */}
        {showEmpty && (
          <View style={styles.center}>
            <Ionicons name="search-outline" size={64} color="#E9ECEF" />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyHint}>Thử tìm với từ khóa khác nhé</Text>
          </View>
        )}

        {/* Kết quả search */}
        {isSearching && !isLoading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <SearchResultItem book={item} onPress={handlePressBook} />
            )}
            contentContainerStyle={styles.resultList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                {results.length} kết quả cho "{query}"
              </Text>
            }
          />
        )}

        {/* Lưới thể loại — hiển thị khi không search */}
        {!isSearching && (
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.3,
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
  emptyHint: { fontSize: 14, color: "#999", marginTop: 6 },

  resultList: { padding: 16, paddingBottom: 100 },
  resultCount: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
    fontWeight: "500",
  },
});
